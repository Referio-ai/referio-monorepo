from typing import Sequence
from fastapi import APIRouter, HTTPException, Depends
from src.schemas.organization import Organization, OrganizationCreate, OrganizationUpdate, OrganizationSearchResults
from src.config.supabase_config import get_supabase_client

router = APIRouter()

@router.get("/", status_code=200, response_model=OrganizationSearchResults)
async def list_organizations(supabase=Depends(get_supabase_client)) -> OrganizationSearchResults:
    """
    List all organizations
    
    Args:
        supabase: Supabase client dependency
        
    Returns:
        OrganizationSearchResults: List of organizations
        
    Raises:
        HTTPException: If there's a database error
    """
    try:
        response = await supabase.table(Organization.table_name).select("*").execute()
        return OrganizationSearchResults(results=[Organization(**org) for org in response.data])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving organizations: {str(e)}")

@router.get("/{organization_id}", status_code=200, response_model=Organization)
async def get_organization(organization_id: str, supabase=Depends(get_supabase_client)) -> Organization:
    """
    Get organization details by ID
    
    Args:
        organization_id (str): The ID of the organization to retrieve
        supabase: Supabase client dependency
        
    Returns:
        Organization: Organization details
        
    Raises:
        HTTPException: If organization is not found or there's a database error
    """
    try:
        response = await supabase.table(Organization.table_name).select("*").eq("id", organization_id).single().execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail=f"Organization with ID {organization_id} not found")
            
        return Organization(**response.data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving organization: {str(e)}")

@router.post("/", status_code=201, response_model=Organization)
async def create_organization(organization: OrganizationCreate, supabase=Depends(get_supabase_client)) -> Organization:
    """
    Create a new organization
    
    Args:
        organization (OrganizationCreate): Organization data to create
        supabase: Supabase client dependency
        
    Returns:
        Organization: Created organization details
        
    Raises:
        HTTPException: If there's a database error
    """
    try:
        response = await supabase.table(Organization.table_name).insert(organization.model_dump()).execute()
        return Organization(**response.data[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating organization: {str(e)}")

@router.put("/{organization_id}", status_code=200, response_model=Organization)
async def update_organization(
    organization_id: str,
    organization: OrganizationUpdate,
    supabase=Depends(get_supabase_client)
) -> Organization:
    """
    Update an existing organization
    
    Args:
        organization_id (str): The ID of the organization to update
        organization (OrganizationUpdate): Updated organization data
        supabase: Supabase client dependency
        
    Returns:
        Organization: Updated organization details
        
    Raises:
        HTTPException: If organization is not found or there's a database error
    """
    try:
        response = await supabase.table(Organization.table_name).update(organization.model_dump()).eq("id", organization_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail=f"Organization with ID {organization_id} not found")
            
        return Organization(**response.data[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating organization: {str(e)}")

@router.delete("/{organization_id}", status_code=204)
async def delete_organization(organization_id: str, supabase=Depends(get_supabase_client)):
    """
    Delete an organization
    
    Args:
        organization_id (str): The ID of the organization to delete
        supabase: Supabase client dependency
        
    Raises:
        HTTPException: If organization is not found or there's a database error
    """
    try:
        response = await supabase.table(Organization.table_name).delete().eq("id", organization_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail=f"Organization with ID {organization_id} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting organization: {str(e)}") 