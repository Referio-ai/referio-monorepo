import { Patient } from '../models/Patient';
import { PatientUpdate } from '../models/PatientUpdate';
import { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class PatientService {
    public static apiV1GetPatients(): CancelablePromise<Array<Patient>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/patients/',
        });
    }

    public static apiV1GetPatientById({
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
        });
    }

    public static apiV1UpdatePatient({
        patientId,
        patient,
    }: {
        patientId: string,
        patient: PatientUpdate,
    }): CancelablePromise<Patient> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/patients/{patient_id}',
            path: {
                'patient_id': patientId,
            },
            body: patient,
        });
    }
}