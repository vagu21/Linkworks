"use client";
import React, { useEffect, useState } from "react";
import { LoaderData } from "~/routes/app.$tenant/g.$group";
import BarChartComponent from "./Charts/barChart";
import PieDonutChart from "./Charts/pieDonutChart";
import StatCard from "./Statcards";
import { LineChartComponent } from "./Charts/linechart";
import { useSearchParams } from "@remix-run/react";

const DashboardCharts = ({ data }: { data: LoaderData }) => {
  const [searchParams] = useSearchParams();
  const period = searchParams.get("period") || "all-time";
  const [jobMetrics, setJobMetrics] = useState<any>([]);
  const subTitle = convertToTitleCase(period);
  const [candidateMetrics, setCandidateMetrics] = useState<any>({});
  const [lineChartData, setLineChartData] = useState<any>([]);

  function mergeMonthlyData(candidates: any, jobApplications: any) {
    const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const mergedData = new Map();

    if (candidates.length > 0 || jobApplications.length > 0) {
      let candidatesStartingMonth = candidates.length > 0 ? candidates[0].month : null;
      let jobApplicationsStartingMonth = jobApplications.length > 0 ? jobApplications[0].month : null;

      if (candidatesStartingMonth !== null && jobApplicationsStartingMonth !== null) {
        if (allMonths.indexOf(candidatesStartingMonth) < allMonths.indexOf(jobApplicationsStartingMonth)) {
          jobApplications.forEach(({ month, JobApplication }: any) => {
            if (!mergedData.has(month)) {
              mergedData.set(month, { month, jobApplication: 0, candidates: 0 });
            }
            mergedData.get(month)!.jobApplication = JobApplication;
          });

          candidates.forEach(({ month, Candidate }: any) => {
            if (!mergedData.has(month)) {
              mergedData.set(month, { month, jobApplication: 0, candidates: 0 });
            }
            mergedData.get(month)!.candidates = Candidate;
          });
        } else {
          candidates.forEach(({ month, Candidate }: any) => {
            if (!mergedData.has(month)) {
              mergedData.set(month, { month, jobApplication: 0, candidates: 0 });
            }
            mergedData.get(month)!.candidates = Candidate;
          });

          jobApplications.forEach(({ month, JobApplication }: any) => {
            if (!mergedData.has(month)) {
              mergedData.set(month, { month, jobApplication: 0, candidates: 0 });
            }
            mergedData.get(month)!.jobApplication = JobApplication;
          });
        }
      } else if (candidatesStartingMonth !== null) {
        candidates.forEach(({ month, Candidate }: any) => {
          if (!mergedData.has(month)) {
            mergedData.set(month, { month, jobApplication: 0, candidates: 0 });
          }
          mergedData.get(month)!.candidates = Candidate;
        });
      } else if (jobApplicationsStartingMonth !== null) {
        jobApplications.forEach(({ month, JobApplication }: any) => {
          if (!mergedData.has(month)) {
            mergedData.set(month, { month, jobApplication: 0, candidates: 0 });
          }
          mergedData.get(month)!.jobApplication = JobApplication;
        });
      }
    }

    allMonths.forEach((month) => {
      if (!mergedData.has(month)) {
        mergedData.set(month, { month, jobApplication: 0, candidates: 0 });
      }
    });

    const finalData = Array.from(mergedData.values());
    setLineChartData(finalData);
  }

  function convertToTitleCase(input: string) {
    return input
      .replace(/-/g, " ") // Replace dashes with spaces
      .toLowerCase() // Convert to lowercase
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
  }

  const prepareJobMetrics = (data: LoaderData) => {
    const jobNumericData = [
      { status: "Open", job: data.dashboardStatsData.Jobs.openJobsCount, fill: "hsl(var(--chart-1))" },
      { status: "Closed", job: data.dashboardStatsData.Jobs.closedJobsCount, fill: "hsl(var(--chart-2))" },
      { status: "Filled", job: data.dashboardStatsData.Jobs.filledJobsCount, fill: "hsl(var(--chart-3))" },
    ];

    setJobMetrics(jobNumericData);
  };

  const prepareCandidateMetrics = (data: LoaderData) => {
    const candidateNumericData = [
      { status: "Proposed", candidate: data.dashboardStatsData.Candidates.proposedCandidatesCount, fill: "hsl(var(--chart-1))" },
      { status: "Interviewing", candidate: data.dashboardStatsData.Candidates.intervieingCandidatesCount, fill: "hsl(var(--chart-2))" },
      { status: "Selected", candidate: data?.dashboardStatsData?.Candidates.selctedCandidatesCount, fill: "hsl(var(--chart-3))" },
      { status: "Rejected", candidate: data?.dashboardStatsData?.Candidates.rejectedCandidatesCount, fill: "hsl(var(--chart-4))" },
      { status: "Hold", candidate: data?.dashboardStatsData?.Candidates.holdCandidatesCount, fill: "hsl(var(--chart-5))" },
      { status: "Cancelled", candidate: data?.dashboardStatsData?.Candidates.cancelledCandidatesCount, fill: "hsl(var(--chart-2))" },
      { status: "Banned", candidate: data?.dashboardStatsData?.Candidates.bannedCandidatesCount, fill: "hsl(var(--chart-4))" },
    ];

    setCandidateMetrics(candidateNumericData);
  };

  useEffect(() => {
    if (data) {
      prepareJobMetrics(data);
      prepareCandidateMetrics(data);
      mergeMonthlyData(data.dashboardStatsData.Candidates.CandidatePerMonthcount, data.dashboardStatsData.JobApplications.JobApplicationPerMonthcount);
    }
  }, [data]);
  return (
    <>
      <div className="flex flex-col gap-4 pb-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div>
            <StatCard
              charTitle={"Open to Work Candidates"}
              charSubTitle={subTitle}
              chartDescription={`Total candidates open to work`}
              numericData={data.dashboardStatsData.Candidates.openToWorkCandidatesCount}
            />
          </div>
          <StatCard
            charTitle={"Open Jobs"}
            charSubTitle={subTitle}
            chartDescription={`Total Open Jobs`}
            numericData={data.dashboardStatsData.Jobs.openJobsCount}
          />
          <StatCard
            charTitle={"Pending Job Applications"}
            charSubTitle={subTitle}
            chartDescription={`Total Pending Job Applications`}
            numericData={data.dashboardStatsData.JobApplications.pendingJobApplicationsCount}
          />
          <StatCard
            charTitle={"Accounts"}
            charSubTitle={subTitle}
            chartDescription={`Total Accounts`}
            numericData={data.dashboardStatsData.Account.accountsCount}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[2fr_1fr]">
          <div>
            {" "}
            {jobMetrics.length && (
              <BarChartComponent
                chartData={candidateMetrics}
                charTitle={"Candidates"}
                charSubTitle={subTitle}
                chartDescription={`Showing total Candidates for ${subTitle}`}
              />
            )}
          </div>
          {candidateMetrics.length && (
            <PieDonutChart chartData={jobMetrics} charTitle={"Jobs"} chartSubTitle={subTitle} chartDescription={`Showing total Jobs for ${subTitle}`} />
          )}
        </div>

        {lineChartData.length && (
          <LineChartComponent
            data={lineChartData}
            charTitle={"Job Applications and Candidates Trend"}
            charSubTitle={""}
            chartDescription={`Job Applications and Candidates Trend`}
          />
        )}
      </div>
    </>
  );
};

export default DashboardCharts;
