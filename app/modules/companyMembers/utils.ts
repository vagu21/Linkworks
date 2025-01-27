
export function appendUserFormValues(formData:any,companyUserFormValues:any)
{
  if (formData instanceof FormData) {
    let numberofUsers:any=0;
    companyUserFormValues.map((user:any,index:any)=>{
      formData.append(`user[${index}]Email`, user.email);
      formData.append(`user[${index}]firstName"`, user.firstName);
      formData.append(`user[${index}]lastName`, user.lastName);
      formData.append(`user[${index}]sendInvitationEmail`, user.sendInvitationEmail ? "true" : "false");
      formData.append(`user[${index}]roles`,user.roles);
      numberofUsers++;
    })

    formData.append("numberOfUsers",numberofUsers);
 
  }

}