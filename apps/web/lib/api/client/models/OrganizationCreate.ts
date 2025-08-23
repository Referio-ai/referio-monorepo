export type OrganizationCreate = {
    organization_name: string;
    organization_address: Record<string, any>;
    organization_primary_contact_fname: string;
    organization_primary_contact_mname: string;
    organization_primary_contact_lname: string;
    organization_primary_contact_email: string;
    organization_primary_contact_phone_number: string;
    organization_prefix: string;
};
