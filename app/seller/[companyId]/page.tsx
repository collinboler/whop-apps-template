import { PageProps } from "@/lib/types";
import { validateToken, WhopAPI, authorizedUserOn, hasAccess } from "@whop-apps/sdk";
import { headers } from "next/headers";



export default async function SellerPage({
  params: { companyId, experienceId },
}: {
  params: { companyId: string, experienceId: string },
}) {
  const { userId } = await validateToken({ headers });
    // Check if the user has access to the company
    const access = await hasAccess({
      to: authorizedUserOn(companyId),
      headers,
    });
  
    // If the user does not have access, return an unauthorized message
    if (!access) {
      return <h1>You do not have access to view this company</h1>;
    }
  // Ensure user is an admin of the company
  if (
    !(await hasAccess({
      to: authorizedUserOn(companyId),
      headers,
    }))
  ) {
    return (
      <div>
        You are not authorized to view this page. You must be an admin of the
        company. (Make sure you are developing in the whop.com iframe if
        testing)
      </div>
    );
  }

  // Fetch information about the company
  const company = await WhopAPI.app().GET("/app/companies/{id}", {
    params: { path: { id: companyId } },
    next: { revalidate: 3600 }, // Customize next revalidation logic
  });

  if (company.isErr) {
    return <div>{company.error.message}</div>;
  }

  // Render the page that allows admins to manage settings/configuration for
  // the company, including the experience ID
  return (
    <div>
      <h1>Manage settings on: {company.data.title}</h1>
      <p>Company: {company.data.id}</p>
      <p>Experience ID: {experienceId}</p>
    </div>
  );
}
