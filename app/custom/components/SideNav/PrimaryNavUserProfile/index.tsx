import React, { Fragment, useState } from "react";
import clsx from "clsx";
import { Link, useParams } from "@remix-run/react";
import ProfileButton from "~/components/layouts/buttons/ProfileButton";
import { Transition } from "@headlessui/react";
import { layout } from "platform";
import { useTranslation } from "react-i18next";
import UrlUtils from "~/utils/app/UrlUtils";
import UserUtils from "~/utils/app/UserUtils";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { useRootData } from "~/utils/data/useRootData";
import { getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import { useOuterClick } from "~/utils/shared/KeypressUtils";
import NewTenantSelector from "~/components/layouts/selectors/NewTenantSelector";
import { useAppData } from "~/utils/data/useAppData";

type MenuOptionProps = {
    label: JSX.Element | null;
    icon?: JSX.Element | null;
    labelText?: string;
    variant?: "default" | "expanded" | "active";
    isCollapsed?: boolean;
    user: { email: string; firstName: string | null; lastName: string | null; avatar: string | null; admin?: { userId: string } | null } | null | undefined;
    layout?: "/" | "app" | "admin" | "docs";
    items?: { title: string; path: string; hidden?: boolean; onClick?: () => void }[];
  };

export const PrimaryNavUserProfile = ({ user, layout, items }: MenuOptionProps) => {
    const params = useParams();
    const { t } = useTranslation();
    const rootData = useRootData();
    const appData = useAppData();
  
    const appOrAdminData = useAppOrAdminData();
    const [opened, setOpened] = useState(false);
  
    function closeDropdownUser() {
      setOpened(false);
    }
  
    const clickOutside = useOuterClick(() => setOpened(false));
    return (
      <div ref={clickOutside} className="relative">
        <div className="inline-flex divide-x divide-gray-300 rounded-sm shadow-none">
          <button
            onClick={() => setOpened(!opened)}
            className={clsx(
              "text-muted-foreground border-border relative inline-flex items-center rounded-full bg-orange-500  font-medium shadow-inner focus:z-10 focus:outline-none focus:ring-offset-2",
              !user?.avatar && "p-2",
              user?.avatar && "p-1"
            )}
            id="user-menu"
            aria-label="User menu"
            aria-haspopup="true"
          >
            {(() => {
              if (user?.avatar) {
                return <img className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800" src={user.avatar} alt="Avatar" />;
              } else {
                return <span className="text-[#FFFFFF] inline-block h-5 w-5 overflow-hidden rounded-full">{user?.firstName?.[0] || "U"}</span>;
              }
            })()}
          </button>
        </div>
  
        <Transition
          as={Fragment}
          show={opened}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <div className="divide-border fixed bottom-[20px] left-[85px] z-50 mt-2 w-64 origin-top-right divide-y overflow-hidden rounded-sm border border-gray-200 bg-[#FFFFFF] shadow-lg focus:outline-none">
            <div className="shadow-xs bg-[#FFFFFF] rounded-sm py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
              <div className="text-muted-foreground group flex items-center truncate px-2.5 py-2 text-sm transition duration-150 ease-in-out" role="menuitem">
                <div className="flex gap-2 truncate">
                  <div className=" divide-x divide-gray-300 rounded-sm shadow-none">
                    <button
                      onClick={() => setOpened(!opened)}
                      className={clsx(
                        "text-muted-foreground border-border relative inline-flex items-center rounded-full bg-orange-500  font-medium shadow-inner focus:z-10 focus:outline-none focus:ring-offset-2",
                        !user?.avatar && "p-2",
                        user?.avatar && "p-1"
                      )}
                      id="user-menu"
                      aria-label="User menu"
                      aria-haspopup="true"
                    >
                      {(() => {
                        if (user?.avatar) {
                          return <img className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800" src={user.avatar} alt="Avatar" />;
                        } else {
                          return (
                            <span className="text-[#FFFFFF] inline-block h-5 w-5 overflow-hidden rounded-full">{`${user?.firstName?.[0] || ""}${
                              user?.lastName?.[0] || ""
                            }`}</span>
                          );
                        }
                      })()}
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="font-medium text-[#121212]">{UserUtils.profileName(appOrAdminData.user)}</div>
                    <div className="text-[#737373] truncate font-light">{appOrAdminData.user?.email}</div>
                  </div>
                </div>
              </div>
              <div className="border-[#E6E6E6] border-t"></div>
  
              {layout === "app" ? (
                <>
                  <Link
                    className=" text-[#737373] block px-4 py-2 text-sm transition duration-150 ease-in-out"
                    role="menuitem"
                    onClick={closeDropdownUser}
                    to={!params.tenant ? "" : UrlUtils.currentTenantUrl(params, `settings/profile`)}
                  >
                    {t("app.navbar.profile")}
                  </Link>
  
                  {getUserHasPermission(appOrAdminData, "app.settings.members.view") && (
                    <Link
                      className=" text-[#737373] block px-4 py-2 text-sm transition duration-150 ease-in-out"
                      role="menuitem"
                      onClick={closeDropdownUser}
                      to={!params.tenant ? "" : UrlUtils.currentTenantUrl(params, "settings/members")}
                    >
                      {t("app.navbar.members")}
                    </Link>
                  )}
  
                  {getUserHasPermission(appOrAdminData, "app.settings.subscription.view") && (
                    <Link
                      className=" text-[#737373] block px-4 py-2 text-sm transition duration-150 ease-in-out"
                      role="menuitem"
                      onClick={closeDropdownUser}
                      to={!params.tenant ? "" : UrlUtils.currentTenantUrl(params, `settings/subscription`)}
                    >
                      {t("app.navbar.subscription")}
                    </Link>
                  )}
  
                  {getUserHasPermission(appOrAdminData, "app.settings.account.view") && (
                    <Link
                      className=" text-[#737373] block px-4 py-2 text-sm transition duration-150 ease-in-out"
                      role="menuitem"
                      onClick={closeDropdownUser}
                      to={!params.tenant ? "" : UrlUtils.currentTenantUrl(params, "settings/account")}
                    >
                      {t("app.navbar.tenant")}
                    </Link>
                  )}
  
                  {/* {getUserHasPermission(appOrAdminData, "app.settings.roles.view") && (
                      <Link
                        className="block px-4 py-2 text-sm transition duration-150 ease-in-out hover:bg-secondary"
                        role="menuitem"
                        onClick={closeDropdownUser}
                        to={!params.tenant ? "" : UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions")}
                      >
                        {t("models.role.plural")}
                      </Link>
                    )} */}
  
                  {/* <Link
                      className="block px-4 py-2 text-sm transition duration-150 ease-in-out hover:bg-secondary"
                      role="menuitem"
                      onClick={closeDropdownUser}
                      to={!params.tenant ? "" : UrlUtils.currentTenantUrl(params, "settings/groups")}
                    >
                      {t("models.group.plural")}
                    </Link> */}
  
                  {rootData.appConfiguration.app.features.linkedAccounts && getUserHasPermission(appOrAdminData, "app.settings.linkedAccounts.view") && (
                    <Link
                      className=" text-[#737373] block px-4 py-2 text-sm transition duration-150 ease-in-out"
                      role="menuitem"
                      onClick={closeDropdownUser}
                      to={!params.tenant ? "" : UrlUtils.currentTenantUrl(params, `settings/linked-accounts`)}
                    >
                      {t("models.linkedAccount.plural")}
                    </Link>
                  )}
  
                  {rootData.appConfiguration.app.features.tenantApiKeys && getUserHasPermission(appOrAdminData, "app.settings.apiKeys.view") && (
                    <Link
                      className=" text-[#737373] block px-4 py-2 text-sm transition duration-150 ease-in-out"
                      role="menuitem"
                      onClick={closeDropdownUser}
                      to={!params.tenant ? "" : UrlUtils.currentTenantUrl(params, `settings/api`)}
                    >
                      {t("models.apiKey.plural")}
                    </Link>
                  )}
  
                  {getUserHasPermission(appOrAdminData, "app.settings.auditTrails.view") && (
                    <Link
                      className=" text-[#737373] block px-4 py-2 text-sm transition duration-150 ease-in-out"
                      role="menuitem"
                      onClick={closeDropdownUser}
                      to={!params.tenant ? "" : UrlUtils.currentTenantUrl(params, "settings/logs")}
                    >
                      {t("models.log.plural")}
                    </Link>
                  )}
  
                  <div className="border-[#E6E6E6] mx-1 mb-2 mt-1 border-t"></div>
                  <span className="text-[#4D4D4D] mx-1 !py-3 px-3 text-[14px]">Switch Account</span>
  
                  {/* {appOrAdminData &&<div>{appData?.currentTenant && <NewTenantSelector key={params.tenant} />}</div>} */}
  
                  {appOrAdminData && (
                    <>
                      {appOrAdminData.myTenants.map((tenant) => {
                        const isCurrentTenant = tenant.id == appOrAdminData.currentTenant?.id;
                        const tenantpathUrl = `/app/${tenant.slug}/dashboard`;
                        return (
                          <Link
                            key={tenant.id} 
                            className={clsx(
                              "group mx-1 flex items-center gap-2.5 rounded-md mb-1  mt-2",
                              isCurrentTenant ? "bg-[#FED702]" : "hover:bg-[#FFEFC9]"
                            )}
                            role="menuitem"
                            onClick={closeDropdownUser}
                            to={tenantpathUrl}
                          >
                            <div className=" group mx-1 flex items-center gap-2.5 rounded-md px-3 py-2">
                              <span className="text-[#FFFFFF] rounded-[4px] bg-orange-500 px-1 text-[12px]">{tenant.name[0]}</span>
                              <span className="text-[#737373] group-hover:text-[#262626] text-sm">{tenant.name}</span>
                            </div>
                          </Link>
                        );
                      })}
                      <Link to={"/new-account"} role="menuitem" onClick={closeDropdownUser}>
                        <div className="text-[#737373] hover:bg-sub-menu-background-selected group mx-1 flex items-center gap-2 rounded-md px-3 py-2 text-[14px] mb-[4px]">
                          <div className="w-4 flex-shrink-0">
                            {/* <PlusIcon className="h-4 w-4 p-0.5" /> */}
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <g clip-path="url(#clip0_2985_42252)">
                                <path
                                  d="M14.9974 10.8385H10.8307V15.0052C10.8307 15.4635 10.4557 15.8385 9.9974 15.8385C9.53906 15.8385 9.16406 15.4635 9.16406 15.0052V10.8385H4.9974C4.53906 10.8385 4.16406 10.4635 4.16406 10.0052C4.16406 9.54688 4.53906 9.17188 4.9974 9.17188H9.16406V5.00521C9.16406 4.54688 9.53906 4.17188 9.9974 4.17188C10.4557 4.17188 10.8307 4.54688 10.8307 5.00521V9.17188H14.9974C15.4557 9.17188 15.8307 9.54688 15.8307 10.0052C15.8307 10.4635 15.4557 10.8385 14.9974 10.8385Z"
                                  fill="#737373"
                                />
                              </g>
                              <defs>
                                <clipPath id="clip0_2985_42252">
                                  <rect width="20" height="20" fill="white" />
                                </clipPath>
                              </defs>
                            </svg>
                          </div>
                          <div className="group-hover:text-input-key">{t("app.tenants.create.title")}</div>
                        </div>
                        <div className="border-[#E6E6E6] mx-1 border-t"></div>
                      </Link>
                    </>
                  )}
                </>
              ) : layout === "admin" ? (
                <Link
                  className=" text-[#737373] block px-4 py-2 text-sm transition duration-150 ease-in-out"
                  role="menuitem"
                  onClick={closeDropdownUser}
                  to={!user ? "" : `/admin/settings/profile`}
                >
                  {t("app.navbar.profile")}
                </Link>
              ) : layout === "/" ? (
                <Fragment>
                  {user?.admin && (
                    <Link
                      className=" text-[#737373] block px-4 py-2 text-sm transition duration-150 ease-in-out"
                      role="menuitem"
                      onClick={closeDropdownUser}
                      to="/admin"
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    className=" text-[#737373] block px-4 py-2 text-sm transition duration-150 ease-in-out"
                    role="menuitem"
                    onClick={closeDropdownUser}
                    to={`/settings`}
                  >
                    {t("app.navbar.profile")}
                  </Link>
                  <Link
                    className=" text-[#737373] block px-4 py-2 text-sm transition duration-150 ease-in-out"
                    role="menuitem"
                    onClick={closeDropdownUser}
                    to={`/settings/subscription`}
                  >
                    {t("app.navbar.subscription")}
                  </Link>
                </Fragment>
              ) : items ? (
                items.map((item:any) => (
                  <Link
                    key={item.path}
                    className=" text-[#737373] block px-4 py-2 text-sm transition duration-150 ease-in-out"
                    role="menuitem"
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick();
                      }
                      closeDropdownUser();
                    }}
                    to={item.path}
                  >
                    {item.title}
                  </Link>
                ))
              ) : null}
  
              {!items && (
                <Link
                  to="/logout"
                  // onClick={signOut}
                  className=" text-[#FE7070] hover:bg-[#FEF1F0] flex w-full gap-2.5 px-4 py-2 text-left text-sm transition duration-150 ease-in-out focus:outline-none"
                  role="menuitem"
                  // disabled={!user}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M14.1667 6.66667L12.9917 7.84167L14.3083 9.16667H7.5V10.8333H14.3083L12.9917 12.15L14.1667 13.3333L17.5 10L14.1667 6.66667ZM4.16667 4.16667H10V2.5H4.16667C3.25 2.5 2.5 3.25 2.5 4.16667V15.8333C2.5 16.75 3.25 17.5 4.16667 17.5H10V15.8333H4.16667V4.16667Z"
                      fill="#FE7070"
                    />
                  </svg>
  
                  {t("app.navbar.logOut")}
                </Link>
              )}
            </div>
          </div>
        </Transition>
      </div>
    );
  };