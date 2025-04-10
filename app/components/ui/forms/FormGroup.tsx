import { Form, useActionData, useSubmit, useNavigation } from "@remix-run/react";
import clsx from "clsx";
import { FormEvent, forwardRef, ReactNode, Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ButtonSecondary from "../buttons/ButtonSecondary";
import ConfirmModal, { RefConfirmModal } from "../modals/ConfirmModal";
import ErrorModal, { RefErrorModal } from "../modals/ErrorModal";
import InfoBanner from "../banners/InfoBanner";
import ErrorBanner from "../banners/ErrorBanner";
import AIButton from "~/custom/components/AIButton";
import AIPrompt from "~/custom/components/AIPrompt";
import Footer from "~/custom/Footer/footer";
import LoadingButton from "../buttons/LoadingButton";
import { createPortal } from "react-dom";
import DeleteTaskPopup from "~/custom/components/deletePopup/DeleteTaskPopup";


export interface RefFormGroup {
  submitForm: () => void;
}

interface Props {
  id?: string | undefined;
  onCancel?: () => void;
  children: ReactNode;
  className?: string;
  classNameFooter?: string;
  editing?: boolean;
  isDrawer?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  canSubmit?: boolean;
  onSubmit?: (e: FormData) => void | undefined;
  onDelete?: () => void;
  onCreatedRedirect?: string;
  confirmationPrompt?: {
    title: string;
    yesTitle?: string;
    noTitle?: string;
    description?: string;
  };
  deleteRedirect?: string;
  actionNames?: {
    create?: string;
    update?: string;
    delete?: string;
  };
  state?: { loading?: boolean; submitting?: boolean };
  message?: {
    success?: string;
    error?: string;
  };
  labels?: {
    create?: string;
  };
  withErrorModal?: boolean;
  submitDisabled?: boolean;
  headers?: any;
  onChangePrefill?: any;
  item?: any;
  entity?: any;
  routes?: any;
  isAIAvailable?: boolean;
}
const FormGroup = (
  {
    id,
    onCancel,
    children,
    className,
    isDrawer,
    classNameFooter,
    editing,
    canUpdate = true,
    canDelete = true,
    canSubmit = true,
    confirmationPrompt,
    onSubmit,
    onCreatedRedirect,
    deleteRedirect,
    onDelete,
    actionNames,
    state,
    message,
    labels,
    withErrorModal = true,
    submitDisabled,
    headers,
    item,
    entity,
    routes,
    onChangePrefill,
    isAIAvailable = false,
  }: Props,
  ref: Ref<RefFormGroup>
) => {
  const { t } = useTranslation();

  const formRef = useRef<HTMLFormElement>(null);
  useImperativeHandle(ref, () => ({
    submitForm,
  }));
  function submitForm() {
    const formData = new FormData(formRef.current!);
    submit(formData, {
      method: "post",
    });
  }

  const actionData = useActionData<{
    error?: string;
  }>();
  const navigation = useNavigation();
  const loading = navigation.state === "submitting" || state?.submitting;
  const submit = useSubmit();

  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const confirmSubmit = useRef<RefConfirmModal>(null);
  const errorModal = useRef<RefErrorModal>(null);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [error, setError] = useState<string>();
  const [formData, setFormData] = useState<FormData>();

  useEffect(() => {
    setError(actionData?.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  useEffect(() => {
    setError(undefined);
    if (error) {
      errorModal.current?.show(t("shared.error"), error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);


  function remove() {
    setShowDeletePopup(true);
  }

  function handleDeleteConfirm() {
    if (onDelete) {
      onDelete();
    } else {
      const form = new FormData();
      form.set("action", actionNames?.delete ?? "delete");
      form.set("id", id ?? "");
      form.set("redirect", deleteRedirect ?? "");
      submit(form, {
        method: "post",
      });
    }
    setShowDeletePopup(false);
  }


  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.stopPropagation();
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (confirmationPrompt) {
      setFormData(formData);
      confirmSubmit.current?.show(confirmationPrompt.title, confirmationPrompt.yesTitle, confirmationPrompt.noTitle, confirmationPrompt.description);
    } else {
      if (onSubmit !== undefined) {
        onSubmit(formData);
      } else {
        submit(formData, {
          method: "post",
        });
      }
    }
  }

  function yesSubmit() {
    if (formData) {
      if (onSubmit !== undefined) {
        onSubmit(formData);
      } else {
        submit(formData, {
          method: "post",
        });
      }
    }
  }

  return (
    <Form ref={formRef} method="post" acceptCharset="utf-8" className={clsx(className, "py-1")} onSubmit={handleSubmit}>
      <input type="hidden" name="action" value={id ? actionNames?.update ?? "edit" : actionNames?.create ?? "create"} hidden readOnly />
      <input type="hidden" name="id" value={id ?? ""} hidden readOnly />
      <div className="space-y-3">
        {isAIAvailable && (
          <div className="flex justify-center ">
            <AIButton
              onClick={(e: any) => {
                e.preventDefault();
                e.stopPropagation();
                setShowAIPrompt(!showAIPrompt);
              }}
              showPrompt={showAIPrompt}
              setShowAIPrompt={setShowAIPrompt}
              headers={headers}
              item={item}
              routes={routes}
              entity={entity}
              onChange={onChangePrefill}

            />
            {showAIPrompt && (
              <div className="absolute  right-0 top-14 z-50">
                <AIPrompt
                  showPrompt={showAIPrompt}
                  setShowAIPrompt={setShowAIPrompt}
                  headers={headers}
                  item={item}
                  routes={routes}
                  entity={entity}
                  onChange={onChangePrefill}
                />
              </div>
            )}
          </div>
        )}
        {children}
        {(!id || editing) && canSubmit && (
          <div
            className={clsx(classNameFooter, "flex justify-between space-x-2",  {
              " absolute bg-white bottom-0 left-0 right-0 mt-3 border-t border-[#D9D9D9] pr-[20px] px-3 py-3": isDrawer, 
            })}
          >
            <div className="flex items-center space-x-2 pl-4">
              {id && canDelete && (
                <ButtonSecondary disabled={loading || !canDelete} destructive={true} type="button" onClick={remove}>
                  <div>{t("shared.delete")}</div>
                </ButtonSecondary>
              )}
            </div>

            <div className="relative flex items-center gap-2">
              {onCancel && (
                <ButtonSecondary onClick={onCancel} disabled={loading}>
                  <div>{t("shared.cancel")}</div>
                </ButtonSecondary>
              )}
              {id === undefined && onCreatedRedirect === "addAnother" ? (
                <div>
                  <LoadingButton isLoading={state?.submitting} type="submit" disabled={loading || submitDisabled}>
                    <div>{t("shared.saveAndAdd")}</div>
                  </LoadingButton>
                </div>
              ) : (
                <LoadingButton isLoading={state?.submitting} type="submit" disabled={loading || (id !== undefined && !canUpdate) || submitDisabled}>
                  {labels?.create ?? t("shared.saveDetails")}
                </LoadingButton>
              )}
              {/* <Footer isDrawer={isDrawer} loading={loading} canUpdate={canUpdate} submitDisabled={submitDisabled} labels={labels} onSubmit={submitForm} /> */}
            </div>

            {message && (
              <div>
                {<InfoBanner title={t("shared.success")} text={message.success} />}
                {<ErrorBanner title={t("shared.error")} text={message.error} />}
              </div>
            )}
          </div>
        )}
      </div>
      <ConfirmModal ref={confirmSubmit} onYes={yesSubmit} />
      {showDeletePopup &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
            <DeleteTaskPopup onDelete={handleDeleteConfirm} onCancel={() => setShowDeletePopup(false)} />
          </div>,
          document.body
        )}
      {withErrorModal && canSubmit && <ErrorModal ref={errorModal} />}
    </Form>
  );
};

export default forwardRef(FormGroup);