import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://10.211.55.5:3010';

// Types for the API responses
export interface InterviewStep {
    id: number;
    interviewFlowId: number;
    interviewTypeId: number;
    name: string;
    orderIndex: number;
}

export interface InterviewFlow {
    id: number;
    description: string;
    interviewSteps: InterviewStep[];
}

export interface InterviewFlowResponse {
    positionName: string;
    interviewFlow: InterviewFlow;
}

export interface Candidate {
    id: number;
    fullName: string;
    currentInterviewStep: string;
    averageScore: number;
    applicationId: number;
}

export interface UpdateCandidateStagePayload {
    applicationId: number;
    currentInterviewStep: number;
}

/**
 * Get the interview flow for a specific position
 * @param positionId - The ID of the position
 * @returns Promise with the interview flow data
 */
export const getInterviewFlow = async (positionId: number): Promise<InterviewFlowResponse> => {
    // Validate positionId
    if (!positionId || isNaN(positionId) || positionId <= 0) {
        throw new Error('ID de posición inválido');
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/position/${positionId}/interviewflow`, {
            timeout: 10000, // 10 second timeout
        });

        // Validate response data
        if (!response.data) {
            throw new Error('Respuesta vacía del servidor');
        }

        return response.data;
    } catch (error: any) {
        console.error('Error fetching interview flow:', error);
        
        // Re-throw with original error for better error handling in component
        if (axios.isAxiosError(error)) {
            throw error;
        }
        
        throw new Error('Error al obtener el flujo de entrevistas');
    }
};

/**
 * Get all candidates for a specific position
 * @param positionId - The ID of the position
 * @returns Promise with the list of candidates
 */
export const getCandidates = async (positionId: number): Promise<Candidate[]> => {
    // Validate positionId
    if (!positionId || isNaN(positionId) || positionId <= 0) {
        throw new Error('ID de posición inválido');
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/position/${positionId}/candidates`, {
            timeout: 10000, // 10 second timeout
        });

        // Validate response is an array
        if (!Array.isArray(response.data)) {
            console.warn('Expected array of candidates, got:', typeof response.data);
            return [];
        }

        return response.data;
    } catch (error: any) {
        console.error('Error fetching candidates:', error);
        
        // Re-throw with original error for better error handling in component
        if (axios.isAxiosError(error)) {
            throw error;
        }
        
        throw new Error('Error al obtener los candidatos');
    }
};

/**
 * Update the interview stage of a candidate
 * @param candidateId - The ID of the candidate
 * @param payload - Object containing applicationId and new interview step
 * @returns Promise with the updated application data
 */
export const updateCandidateStage = async (
    candidateId: number,
    payload: UpdateCandidateStagePayload
): Promise<any> => {
    // Validate inputs
    if (!candidateId || isNaN(candidateId) || candidateId <= 0) {
        throw new Error('ID de candidato inválido');
    }

    if (!payload.applicationId || isNaN(payload.applicationId) || payload.applicationId <= 0) {
        throw new Error('ID de aplicación inválido');
    }

    if (!payload.currentInterviewStep || isNaN(payload.currentInterviewStep) || payload.currentInterviewStep <= 0) {
        throw new Error('ID de etapa de entrevista inválido');
    }

    try {
        const response = await axios.put(
            `${API_BASE_URL}/candidates/${candidateId}`, 
            payload,
            {
                timeout: 10000, // 10 second timeout
            }
        );

        return response.data;
    } catch (error: any) {
        console.error('Error updating candidate stage:', error);
        
        // Re-throw with original error for better error handling in component
        if (axios.isAxiosError(error)) {
            throw error;
        }
        
        throw new Error('Error al actualizar la etapa del candidato');
    }
};
