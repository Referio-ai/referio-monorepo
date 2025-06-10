/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Patient } from '../models/Patient';
import type { PatientCreate } from '../models/PatientCreate';
import type { PatientUpdate } from '../models/PatientUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PatientsService {
    /**
     * Get Patients
     * Get all patients
     *
     * Returns:
     * List[Patient]: A list of all patients in the system
     * Each Patient contains:
     * - patient_id: UUID - Unique identifier for the patient
     * - patient_fname: str - First name of the patient
     * - patient_mname: Optional[str] - Middle name of the patient
     * - patient_lname: str - Last name of the patient
     * - patient_dob: date - Date of birth of the patient
     * - patient_contact_phone: str - Contact phone number of the patient
     * - patient_contact_email: EmailStr - Contact email address of the patient
     * - patient_dob: str - Date of birth of the patient
     * - patient_contact_phone: str - Contact phone number of the patient
     * - patient_contact_email: EmailStr - Contact email address of the patient
     * - patient_insurance_member_id: Optional[str] - Insurance member ID of the patient
     * @returns Patient Successful Response
     * @throws ApiError
     */
    public static apiV1GetPatients(): CancelablePromise<Array<Patient>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/patients/',
            errors: {
                404: `Patient Endpoints`,
            },
        });
    }
    /**
     * Create Patient
     * Create a new patient
     *
     * Parameters:
     * patient (PatientCreate): The patient data to create
     *
     * Returns:
     * Patient: The created patient object containing:
     * - patient_id: UUID - Unique identifier for the patient
     * - patient_fname: str - First name of the patient
     * - patient_mname: Optional[str] - Middle name of the patient
     * - patient_lname: str - Last name of the patient
     * - patient_dob: date - Date of birth of the patient
     * - patient_contact_phone: str - Contact phone number of the patient
     * - patient_contact_email: EmailStr - Contact email address of the patient
     * - patient_insurance_member_id: Optional[str] - Insurance member ID of the patient
     *
     * Raises:
     * HTTPException: 400 if the creation fails
     * @returns Patient Successful Response
     * @throws ApiError
     */
    public static apiV1CreatePatient({
        requestBody,
    }: {
        requestBody: PatientCreate,
    }): CancelablePromise<Patient> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/patients/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Patient Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Patient
     * Get a specific patient by ID
     *
     * Parameters:
     * patient_id (str): The unique identifier of the patient to retrieve
     *
     * Returns:
     * Patient: The requested patient object containing:
     * - patient_id: UUID - Unique identifier for the patient
     * - patient_fname: str - First name of the patient
     * - patient_mname: Optional[str] - Middle name of the patient
     * - patient_lname: str - Last name of the patient
     * - patient_dob: date - Date of birth of the patient
     * - patient_contact_phone: str - Contact phone number of the patient
     * - patient_contact_email: EmailStr - Contact email address of the patient
     * - patient_insurance_member_id: Optional[str] - Insurance member ID of the patient
     *
     * Raises:
     * HTTPException: 404 if the patient is not found
     * @returns Patient Successful Response
     * @throws ApiError
     */
    public static apiV1GetPatient({
        patientId,
    }: {
        patientId: string,
    }): CancelablePromise<Patient> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/patients/{patient_id}',
            path: {
                'patient_id': patientId,
            },
            errors: {
                404: `Patient Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Patient
     * Update a patient
     *
     * Parameters:
     * patient_id (str): The unique identifier of the patient to update
     * patient (PatientUpdate): The updated patient data
     *
     * Returns:
     * Patient: The updated patient object containing:
     * - patient_id: UUID - Unique identifier for the patient
     * - patient_fname: str - First name of the patient
     * - patient_mname: Optional[str] - Middle name of the patient
     * - patient_lname: str - Last name of the patient
     * - patient_dob: date - Date of birth of the patient
     * - patient_contact_phone: str - Contact phone number of the patient
     * - patient_contact_email: EmailStr - Contact email address of the patient
     * - patient_insurance_member_id: Optional[str] - Insurance member ID of the patient
     *
     * Raises:
     * HTTPException: 400 if the update fails
     * @returns Patient Successful Response
     * @throws ApiError
     */
    public static apiV1UpdatePatient({
        patientId,
        requestBody,
    }: {
        patientId: string,
        requestBody: PatientUpdate,
    }): CancelablePromise<Patient> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/patients/{patient_id}',
            path: {
                'patient_id': patientId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Patient Endpoints`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Patient
     * Delete a patient
     *
     * Parameters:
     * patient_id (str): The unique identifier of the patient to delete
     *
     * Returns:
     * Patient: The deleted patient object containing:
     * - patient_id: UUID - Unique identifier for the patient
     * - patient_fname: str - First name of the patient
     * - patient_mname: Optional[str] - Middle name of the patient
     * - patient_lname: str - Last name of the patient
     * - patient_dob: date - Date of birth of the patient
     * - patient_contact_phone: str - Contact phone number of the patient
     * - patient_contact_email: EmailStr - Contact email address of the patient
     * - patient_insurance_member_id: Optional[str] - Insurance member ID of the patient
     *
     * Raises:
     * HTTPException: 400 if the deletion fails
     * @returns Patient Successful Response
     * @throws ApiError
     */
    public static apiV1DeletePatient({
        patientId,
    }: {
        patientId: string,
    }): CancelablePromise<Patient> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/patients/{patient_id}',
            path: {
                'patient_id': patientId,
            },
            errors: {
                404: `Patient Endpoints`,
                422: `Validation Error`,
            },
        });
    }
}
