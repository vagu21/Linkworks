import { RowsApi } from "~/utils/api/.server/RowsApi";
import { db } from "~/utils/db.server";
import { getEntityByName } from "~/utils/db/entities/entities.db.server";
import { getTenantBySlug } from "~/utils/db/tenants.db.server";


async function entityRowCountPerMonth(id: string, entity: string,tenantId:string) {
    const query = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') AS "month",
        COUNT(*) AS "entity_count"
      FROM "Row"
      WHERE "entityId" = $1 AND "tenantId" = $2
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt") ASC;
    `;

    const data = await db.$queryRawUnsafe<{ month: string; entity_count: bigint }[]>(query, id,tenantId);

    return data.map((row) => ({
        month: row.month,
        [entity]: Number(row.entity_count),
    }));

}


function getDateRange(range: String) {
    let endDate = new Date();
    let startDate;

    switch (range) {
        case 'last-7-days':
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 7);
            break;

        case 'last-30-days':
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 30);
            break;

        case 'last-3-months':
            startDate = new Date();
            startDate.setDate(endDate.getDate() - 90);
            break;

        case 'month-to-date':
            startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
            break;

        case 'last-month':
            startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
            endDate = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
            break;

        case 'this-year':
            startDate = new Date(endDate.getFullYear(), 0, 1);
            break;

        case 'last-year':
            startDate = new Date(endDate.getFullYear() - 1, 0, 1);
            endDate = new Date(endDate.getFullYear() - 1, 11, 31);
            break;

        case 'last-24-hours':
            startDate = new Date();
            startDate.setHours(endDate.getHours() - 24);
            break;

        case 'year-to-date':
            startDate = new Date(endDate.getFullYear(), 0, 1);
            break;

        case 'week-to-date':
            startDate = new Date();
            const dayOfWeek = startDate.getDay(); // 0 is Sunday
            startDate.setDate(endDate.getDate() - dayOfWeek);
            startDate.setHours(0, 0, 0, 0);
            break;

        case 'last-hour':
            startDate = new Date();
            startDate.setHours(endDate.getHours() - 1);
            break;

        case 'last-10-minutes':
            startDate = new Date();
            startDate.setMinutes(endDate.getMinutes() - 10);
            break;

        default:
            throw new Error('Invalid range specified');
    }

    return { startDate, endDate };
}

async function getEntityNumericData(entityName: string, urlSearchParams: URLSearchParams, tenantId: string, dateFilter?: string,) {

    let where: any = { tenantId: tenantId };
    if (dateFilter !== "all-time") {
        const { startDate, endDate } = getDateRange(dateFilter == undefined ? "last-30-days" : dateFilter);
        where.createdAt = {
            gte: startDate,
            lte: endDate,
        }
    }
    const data = await RowsApi.getAll({
        entity: { name: entityName },
        urlSearchParams,
        rowWhere: where
    })
    return data.results;
}

export async function getDashBoardData({ request, params }: any) {

    const url = request.url;
    const period = url?.split("?")[1];
    const timePeriod = period?.split("=")[1];
    const tenantSlug = params.tenant;

    const tenant = await getTenantBySlug(tenantSlug);
    const tenantId = tenant?.id||'';

    let data = {};

    let proposedCandidatesCount = await getEntityNumericData("Candidate", new URLSearchParams({ status: 'Proposed' }), tenantId,timePeriod);
    let intervieingCandidatesCount = await getEntityNumericData("Candidate", new URLSearchParams({ status: 'Interviewing' }),tenantId,timePeriod);
    let selctedCandidatesCount = await getEntityNumericData("Candidate", new URLSearchParams({ status: 'Selected' }),tenantId,timePeriod);
    let rejectedCandidatesCount = await getEntityNumericData("Candidate", new URLSearchParams({ status: 'Rejected' }),tenantId,timePeriod);
    let holdCandidatesCount = await getEntityNumericData("Candidate", new URLSearchParams({ status: 'Hold' }),tenantId,timePeriod);
    let cancelledCandidatesCount = await getEntityNumericData("Candidate", new URLSearchParams({ status: 'Cancelled' }),tenantId,timePeriod);
    let bannedCandidatesCount = await getEntityNumericData("Candidate", new URLSearchParams({ status: 'Banned' }),tenantId,timePeriod);
    let openToWorkCandidatesCount = await getEntityNumericData("Candidate", new URLSearchParams({ availability: 'Open to work' }),tenantId,timePeriod);

    let openJobsCount = await getEntityNumericData("Job", new URLSearchParams({ status: 'open' }),tenantId,timePeriod);
    let closedJobsCount = await getEntityNumericData("Job", new URLSearchParams({ status: 'closed' }),tenantId,timePeriod);
    let filledJobsCount = await getEntityNumericData("Job", new URLSearchParams({ status: 'Filled' }),tenantId,timePeriod);

    let pendingJobApplicationsCount = await getEntityNumericData("Job Application", new URLSearchParams({ status: 'Pending' }),tenantId,timePeriod);

    const jobdata = await getEntityNumericData("Job Application", new URLSearchParams(),tenantId,timePeriod);
    const jobapplicationID = await getEntityByName({ tenantId: tenantId, name: "Job Application" });
    const CandidateID = await getEntityByName({ tenantId: tenantId, name: "Candidate" });
    let JobApplicationPerMonthcount = await entityRowCountPerMonth(jobapplicationID.id, "JobApplication", tenantId);
    let CandidatePerMonthcount = await entityRowCountPerMonth(CandidateID.id, "Candidate", tenantId);

    let accountsCount = await getEntityNumericData("Account", new URLSearchParams(), tenantId,timePeriod);

    data = {
        Candidates: {
            proposedCandidatesCount: proposedCandidatesCount,
            intervieingCandidatesCount: intervieingCandidatesCount,
            selctedCandidatesCount: selctedCandidatesCount,
            rejectedCandidatesCount: rejectedCandidatesCount,
            holdCandidatesCount: holdCandidatesCount,
            cancelledCandidatesCount: cancelledCandidatesCount,
            bannedCandidatesCount: bannedCandidatesCount,
            openToWorkCandidatesCount: openToWorkCandidatesCount,
            CandidatePerMonthcount: CandidatePerMonthcount
        },

        Jobs: {
            openJobsCount: openJobsCount,
            closedJobsCount: closedJobsCount,
            filledJobsCount: filledJobsCount
        },

        JobApplications: {
            pendingJobApplicationsCount: pendingJobApplicationsCount,
            JobApplicationPerMonthcount: JobApplicationPerMonthcount
        },

        Account: {
            accountsCount: accountsCount
        }
    }

    return data

}
