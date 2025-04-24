import { FormEvent, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Form, useLocation, useSubmit, useNavigation } from "@remix-run/react";
import { DefaultLogActions } from "~/application/dtos/shared/DefaultLogActions";
import UserBadge from "~/components/core/users/UserBadge";
import CalendarFilledIcon from "~/components/ui/icons/CalendarFilledIcon";
import QuestionMarkFilledIcon from "~/components/ui/icons/QuestionMarkFilledIcon";
import { LogWithDetails } from "~/utils/db/logs.db.server";
import DateUtils from "~/utils/shared/DateUtils";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import clsx from "clsx";
import { Button } from "~/components/ui/button";
import CommentIcon from "~/components/ui/icons/CommentIcon";
import CommentCard from "./commentCard";
import EditIcon from "~/components/ui/icons/EditIcon";

interface Props {
  items: LogWithDetails[];
  hasActivity?: boolean;
  hasComments?: boolean;
  onSubmit?: (formData: FormData) => void;
  withTitle?: boolean;
  autoFocus?: boolean;
}

export default function Activities({ items, hasActivity = true, hasComments, onSubmit, withTitle = true, autoFocus }: Props) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const transition = useNavigation();
  const submit = useSubmit();
  const isAdding = transition.state === "submitting" && transition.formData?.get("action") === "comment";
  const formRef = useRef<HTMLFormElement>(null);
  const location = useLocation();

  useEffect(() => {
    formRef.current?.reset();
  }, [isAdding]);

  const sortedItems = () => {
    const filteredItems = items.filter((item) => {
      if (item.commentId && !hasComments) {
        return false;
      }
      return true;
    });
    return filteredItems.slice().sort((x, y) => {
      if (x.createdAt && y.createdAt) {
        return x.createdAt > y.createdAt ? 1 : -1;
      }
      return 1;
    });
  };

  function getActionDescription(item: LogWithDetails) {
    return item.action;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.stopPropagation();
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
  
      submit(formData, {
        method: "post",
        action: location.pathname + location.search,
      });
    
  }

  function handleCancel(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    formRef.current?.reset();
  }

  return (
    <>
      <div>
        <div className={clsx("w-full min-w-[20vw] space-y-6 text-xs", withTitle && "pt-4")}>
          {hasComments && (
            <div className="">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-7 w-7 rounded-md border border-[#F0F0F0] p-1">
                    <CommentIcon className="h-5 w-5" strokeColor="#1B1714" aria-hidden="true" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <Form ref={formRef} onSubmit={handleSubmit} method="post" className="space-y-2">
                    <div>
                      <input hidden readOnly name="action" value="comment" />
                      <label htmlFor="comment" className="sr-only">
                        {t("shared.comment")}
                      </label>
                      <textarea
                        autoFocus={autoFocus}
                        required
                        id="comment"
                        name="comment"
                        rows={3}
                        className={clsx(
                          "block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm",
                          (isAdding || !appOrAdminData.user) && "cursor-not-allowed bg-gray-100"
                        )}
                        placeholder="Ex : I have edited..."
                        defaultValue={""}
                        disabled={isAdding || !appOrAdminData.user}
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        className="h-[24px] border-2 border-dashed border-[#D9D9D9]"
                        disabled={isAdding || !appOrAdminData.user}
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                      <Button variant="outline" className="h-[24px] bg-black text-white" disabled={isAdding || !appOrAdminData.user} type="submit">
                        Save
                      </Button>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          )}
          {/* Activity feed*/}
          <div className="">
            <ul className="-mb-8 space-y-6 pb-6">
              {sortedItems().map((item, idx) => (
                <li key={item.id}>
                  <div className="relative">
                    {idx !== sortedItems().length - 1 ? <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" /> : null}
                    <div className="relative flex items-start space-x-3">
                      {item.comment ? (
                        <>{hasComments && <CommentCard item={item} />}</>
                      ) : (
                        <>
                          <div>
                            <div className="relative px-1">
                              <div className="relative">
                                <div className="h-7 w-7 rounded-md border border-[#F0F0F0] p-1">
                                  {item.action === DefaultLogActions.Created ? (
                                    <CalendarFilledIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                  ) : item.action === DefaultLogActions.Updated ? (
                                    <EditIcon strokeColor="#1B1714" />
                                  ) : (
                                    <QuestionMarkFilledIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1 py-0">
                            <div className=" text-gray-500">
                              <span className="mr-0.5 flex items-center space-x-1 text-sm">
                                <div className="font-medium text-gray-900">
                                  {item.user && (
                                    <span>
                                      <UserBadge item={item.user} withEmail={false} />
                                    </span>
                                  )}
                                </div>
                              </span>

                              <span className="mr-0.5" title={JSON.stringify(item.details) !== JSON.stringify("{}") ? item.details?.toString() : ""}>
                                {getActionDescription(item)}
                              </span>
                              <span className="whitespace-nowrap pt-1">
                                <time dateTime={DateUtils.dateYMDHMS(item.createdAt)}>{DateUtils.dateAgo(item.createdAt)}</time>
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
