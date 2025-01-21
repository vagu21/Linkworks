import { useFetcher, useLoaderData, useNavigation, useParams, useOutlet, useNavigate } from "@remix-run/react";
import React, { useEffect, useState } from "react";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import { useAppData } from "~/utils/data/useAppData";
import { UserWithRoles } from "~/utils/db/users.db.server";
import { Role } from "@prisma/client";
import { t } from "i18next";
import clsx from "clsx";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
const CompanyMemberTable = ({ companyUserFormValues, setCompanyUserFormValues }: any) => {
  const [data, setData]: any = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [open, setOpen] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [inputEmail, setInputEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [companyRoles, setCompanyRoles] = useState([]);
  const appData = useAppData();
  const fetcher = useFetcher();
  const outlet = useOutlet();
  const navigate = useNavigate();
  const params = useParams();
  const navigation = useNavigation();
  const loading = navigation.state === "submitting";

  async function getCompanyRoles() {
    try {
      const data :any= await fetch("https://works.lfiapps.com/api/getCompanyRoles");
            if(data.ok)
            {
      const response=await data.json();
      console.log("response",response);
      setCompanyRoles(response);
            }
    } catch (error) {
      throw error;
    }

  
  }
  useEffect(() => {
    getCompanyRoles();
    fetchData();
  }, []);
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      console.log("Fetcher load completed", fetcher.data);
      setData(fetcher.data);
      // console.log("data", data.users);
    }
  }, [fetcher.state, fetcher.data]);

  const fetchData = () => {
    fetcher.load(`/app/${params.tenant}/settings/members`);
    setData(fetcher.data);
  };
  // console.log("datazzz", data);
  const filteredItems = () => {
    if (!data.users) {
      return [];
    }
    return data.users.filter(
      (f: any) =>
        f.user.firstName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.user.lastName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.user.email?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.user.phone?.toString().toUpperCase().includes(searchInput.toUpperCase())
    );
  };
  const sortedItems = () => {
    if (!data.users) {
      return [];
    }
    const filtered = filteredItems()
      .slice()
      .sort(({ x, y }: any) => {
        return x?.type > y?.type ? -1 : 1;
      });
    return filtered.sort(({ x, y }: any) => {
      return x?.type > y?.type ? 1 : -1;
    });
  };

  function onSetRole(item: UserWithRoles, role: Role, add: any) {
    const form = new FormData();
    form.set("action", "edit");
    form.set("user-id", item.id);
    form.set("role-id", role.id);
    form.set("add", add ? "true" : "false");
    // submit(form, {
    //   method: "post",
    // });
  }

  function handleSubmitNewUser() {
    const form = {} as any;
    form.email = inputEmail;
    form.firstName = firstName;
    form.lastName = lastName;
    form.sendInvitationEmail = sendEmail;
    form.roles=selectedRoles;
    console.log("form", form);
    setCompanyUserFormValues([...companyUserFormValues, form]);
    setOpen(false);
    // setShowNewUserForm(false);
  }

  return (
    <>
      <SlideOverWideEmpty
        title={params.id ? "Edit Member" : "New Member"}
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        className="sm:max-w-2xl"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">{outlet}</div>
          <div className="space-y-2">
            <div className=" pb-4">
              <div className="grid grid-cols-2 gap-2">
                {/*Email */}
                <div className="col-span-2">
                  <label htmlFor="email" className="block truncate text-xs font-medium text-gray-700">
                    <div className="flex space-x-1 truncate">
                      <div>{t("models.user.email")}</div>
                      <div className="ml-1 text-red-500">*</div>
                    </div>
                  </label>
                  <div className="mt-1 flex w-full rounded-md shadow-sm">
                    <input
                      type="email"
                      // ref={inputEmail}
                      name="email"
                      id="email"
                      autoComplete="off"
                      required
                      defaultValue={inputEmail}
                      onChange={(e) => setInputEmail(e.target.value)}
                      disabled={loading}
                      className={clsx(
                        "focus:border-theme-500 focus:ring-theme-500 block w-full min-w-0 flex-1 rounded-md border-gray-300 lowercase sm:text-sm",
                        loading && "cursor-not-allowed bg-gray-100"
                      )}
                    />
                  </div>
                </div>
                {/*Email: End */}

                {/*User First Name */}
                <div>
                  <label htmlFor="first-name" className="block truncate text-xs font-medium text-gray-700">
                    <div className="flex space-x-1 truncate">
                      <div>{t("models.user.firstName")}</div>
                      <div className="ml-1 text-red-500">*</div>
                    </div>
                  </label>
                  <div className="mt-1 flex w-full rounded-md shadow-sm">
                    <input
                      type="text"
                      id="first-name"
                      name="first-name"
                      autoComplete="off"
                      required
                      onChange={(e) => setFirstName(e.target.value)}
                      defaultValue={firstName}
                      className={clsx(
                        "focus:border-theme-500 focus:ring-theme-500 block w-full min-w-0 flex-1 rounded-md border-gray-300 sm:text-sm",
                        loading && "cursor-not-allowed bg-gray-100"
                      )}
                    />
                  </div>
                </div>
                {/*User First Name: End */}

                {/*User Last Name */}
                <div>
                  <label htmlFor="last-name" className="block truncate text-xs font-medium text-gray-700">
                    {t("models.user.lastName")}
                  </label>
                  <div className="mt-1 flex w-full rounded-md shadow-sm">
                    <input
                      type="text"
                      id="last-name"
                      name="last-name"
                      autoComplete="off"
                      defaultValue={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={clsx(
                        "focus:border-theme-500 focus:ring-theme-500 block w-full min-w-0 flex-1 rounded-md border-gray-300 sm:text-sm",
                        loading && "cursor-not-allowed bg-gray-100"
                      )}
                    />
                  </div>
                </div>
                {/*User Last Name: End */}


                <div className="col-span-2">
                  <InputCheckboxWithDescription
                    name="send-invitation-email"
                    title="Send email"
                    description="Send an invitation email to the user"
                    value={sendEmail}
                    setValue={setSendEmail}
                  />
                </div>
              </div>
              <div className="space-y-2 pt-2 ">
              {companyRoles?.map((role: any) => (
                <InputCheckboxWithDescription
                  key={role.name}
                  name={role.name}
                  title={role.name}
                  description={role.description}
                  value={selectedRoles.includes(role.id)}
                  setValue={(e) => {
                    if (e) {
                      setSelectedRoles((f) => [...f, role.id]);
                    } else {
                      setSelectedRoles((f) => f.filter((f) => f !== role.id));
                    }
                  }}
                />
              ))}
            </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-theme-700 text-sm">{loading && <div>{t("shared.loading")}...</div>}</div>

                <div className="flex items-center space-x-2">
                  <button
                    disabled={loading}
                    className={clsx(
                      "focus:ring-theme-500 inline-flex items-center space-x-2 border border-gray-300 bg-white px-3 py-2 font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:rounded-md sm:text-sm",
                      loading && "cursor-not-allowed bg-gray-100"
                    )}
                    type="button"
                    onClick={() => setOpen(false)}
                  >
                    <div>{t("shared.cancel")}</div>
                  </button>
                  <button
                    onClick={() => {
                      handleSubmitNewUser();
                    }}
                    disabled={selectedRoles?.length === 0 }
                    className={clsx(
                      "bg-primary hover:bg-primary/90 focus:ring-primary inline-flex items-center space-x-2 border border-transparent px-3 py-2 font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:rounded-md sm:text-sm",
                      loading && "cursor-not-allowed opacity-50"
                    )}
                  >
                    <div>Save</div>
                  </button>
                </div>
              </div>
            </div>

            {/* <InputSearch
                            value={searchInput}
                            setValue={setSearchInput}
                        // onNewRoute={!getUserHasPermission(appData, "app.settings.members.create") ? "" : UrlUtils.currentTenantUrl(params, "settings/members/new")}
                        /> */}
            {/* <button onClick={()=>setShowNewUserForm(true)}>New</button> */}
            {}
            
          </div>
        </div>
      </SlideOverWideEmpty>
    </>
  );
};

export default CompanyMemberTable;
