import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import ShowPayloadModalButton from "~/components/ui/json/ShowPayloadModalButton";
import EditPageLayout from "~/components/ui/layouts/EditPageLayout";
import TableSimple from "~/components/ui/tables/TableSimple";
import { SurveySubmissionWithDetails, getSurveySubmissions } from "~/modules/surveys/db/surveySubmissions.db.server";
import { getSurveyById } from "~/modules/surveys/db/surveys.db.server";
import { SurveyDto } from "~/modules/surveys/dtos/SurveyDtos";
import SurveyUtils from "~/modules/surveys/utils/SurveyUtils";
import { requireAuth } from "~/utils/loaders.middleware";
import { getTenantIdOrNull } from "~/utils/services/.server/urlService";

type LoaderData = {
  item: SurveyDto;
  submissions: SurveySubmissionWithDetails[];
};

export let loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireAuth({ request, params });
  const tenantId = await getTenantIdOrNull({ request, params });
  let item = await getSurveyById({ tenantId, id: params.id! });
  if (!item) {
    return redirect("/admin/help-desk/surveys");
  }
  const submissions = await getSurveySubmissions(item.id);
  const data: LoaderData = {
    item: SurveyUtils.surveyToDto(item),
    submissions,
  };
  return json(data);
};

export default function () {
  const { t } = useTranslation();
  const data = useTypedLoaderData<LoaderData>();
  const actionData = useTypedActionData<{ success?: string; error?: string }>();
  const params = useParams();

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData?.success);
    } else if (actionData?.error) {
      toast.error(actionData?.error);
    }
  }, [actionData]);

  return (
    <EditPageLayout
      withHome={false}
      title={data.item.title}
      buttons={
        <>
          <ButtonSecondary to={`/admin/help-desk/surveys/${params.id}/edit`}>{t("shared.edit")}</ButtonSecondary>
        </>
      }
      // menu={[
      //   {
      //     title: "Surveys",
      //     routePath: "/admin/help-desk/surveys",
      //   },
      //   {
      //     title: t("shared.overview"),
      //     routePath: "",
      //   },
      // ]}
      tabs={[
        { name: "Overview", routePath: `/admin/help-desk/surveys/${params.id}` },
        { name: "Submissions", routePath: `/admin/help-desk/surveys/${params.id}/submissions` },
      ]}
    >
      <div className="space-y-2">
        {data.item.items.map((surveyItem, idx) => {
          return (
            <div key={idx} className="space-y-1">
              <p className="text-base font-semibold">{surveyItem.title}</p>
              <TableSimple
                items={surveyItem.options}
                headers={[
                  {
                    name: "title",
                    title: "Title",
                    className: "w-full",
                    value: (item) => {
                      if (item.isOther) {
                        const results = data.submissions.flatMap((f) => f.results).filter((result) => result.surveItemTitle === surveyItem.title);
                        return (
                          <ShowPayloadModalButton
                            description={item.title}
                            payload={JSON.stringify(
                              results.map((f) => f.other),
                              null,
                              2
                            )}
                          />
                        );
                      }
                      return <div>{item.title}</div>;
                    },
                  },
                  {
                    name: "votes",
                    title: "Votes",
                    value: (item) => {
                      const itemResults = data.submissions.flatMap((f) => f.results).filter((result) => result.surveItemTitle === surveyItem.title);
                      const optionResults = itemResults.filter((result) => {
                        if (typeof result.value === "string") {
                          return result.value === item.title;
                        } else if (Array.isArray(result.value)) {
                          return result.value.includes(item.title);
                        } else {
                          return false;
                        }
                      });
                      return <div>{optionResults.length} votes</div>;
                    },
                  },
                ]}
              />
            </div>
          );
        })}
      </div>
    </EditPageLayout>
  );
}
