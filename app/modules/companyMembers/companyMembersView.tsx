import { useLocation } from "@remix-run/react";
import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import CompanyMemberTable from "~/custom/components/companyMemberTable";
import { appendUserFormValues } from "./utils";

export const CompanyMembersView = forwardRef(({ params, formData }: any, ref) => {
  const [companyMembersOverview, setCompanyMembersOverview] = useState<any[]>([]);
  const [companyUserFormValues, setCompanyUserFormValues] = useState<any>([]);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const location = useLocation();
  const isEditPage = location.pathname.includes("/edit");
  const isoverViewPage = params.id && !isEditPage;

  function handleRemove(index: number) {
    if (setCompanyUserFormValues) {
      setCompanyUserFormValues((prev = []) => prev.filter((f: any, i: any) => i !== index));
    }
  }
  const fetchCompanyMembers = async () => {
    try {
      const serverUrl = import.meta.env.VITE_PUBLIC_SERVER_URL;
      const response = await fetch(`${serverUrl}/api/get-companyMembers/${params.id}`, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const companyMembers = await response.json();

      setCompanyMembersOverview((prev) => {
        const existingEmails = new Set(prev.map((member) => member.email));

        const newMembers = companyMembers
          .filter((member: any) => !existingEmails.has(member.email))
          .map((member: any) => ({
            email: member.email,
            firstName: member.firstName,
            lastName: member.lastName,
          }));

        return [...prev, ...newMembers];
      });
    } catch (error) {
      console.error("Error fetching company members:", error);
    }
  };

  useImperativeHandle(ref, () => ({
    handleSubmit: (formData: any) => {
      appendUserFormValues(formData, companyUserFormValues);
    },
  }));

  useEffect(() => {
    if (isoverViewPage) {
      fetchCompanyMembers();
    }
  }, []);

  return (
    <>
      <div
        className={`${isoverViewPage == false || isoverViewPage == undefined ? "cursor-pointer" : "cursor-not-allowed"}`}
        onClick={(e) => {
          if (isoverViewPage) {
            e.preventDefault();
            return;
          }
          setShowMemberForm(!showMemberForm);
        }}
      >
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 ">
          Company Member
        </label>
        <div
          className={`mt-1 flex h-12 w-full items-center rounded-md border-2 border-dashed border-gray-300  bg-white px-4 text-gray-400 ${
            isoverViewPage == false || isoverViewPage == undefined ? "hover:border-gray-400" : ""
          } `}
        >
          <span className="text-sm">Add Company Member</span>
        </div>
      </div>

      {showMemberForm && (
        <>
          <CompanyMemberTable companyUserFormValues={companyUserFormValues} setCompanyUserFormValues={setCompanyUserFormValues} />
        </>
      )}
      <div className="grid grid-cols-2 gap-4 ">
        {companyUserFormValues?.map((item: any, index: number) => {
          return (
            <div key={index} className="relative rounded-lg bg-white p-4 shadow-md">
              {/* Cross button in the top-right corner */}
              <button onClick={() => handleRemove(index)} className="absolute right-2 top-2 text-red-500 hover:text-red-700" aria-label="Remove">
                &times; {/* Cross symbol */}
              </button>
              {/* Item Details */}
              <p>Email: {item?.email}</p>
              <p>First Name: {item?.firstName}</p>
              <p>Last Name: {item?.lastName}</p>
              <p>Send Invitation Email: {item?.sendInvitationEmail ? "Yes" : "No"}</p>
            </div>
          );
        })}
        {isoverViewPage &&
          companyMembersOverview?.map((item: any, index: number) => {
            return (
              <div key={index} className="relative cursor-not-allowed rounded-lg bg-white p-4 shadow-md">
                <p>Email: {item?.email}</p>
                <p>First Name: {item?.firstName}</p>
                <p>Last Name: {item?.lastName}</p>
              </div>
            );
          })}
      </div>
    </>
  );
});
