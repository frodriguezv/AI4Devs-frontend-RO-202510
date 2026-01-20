import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner, Alert, Toast, ToastContainer, Button } from 'react-bootstrap';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    DragOverEvent,
    DndContextProps,
    closestCenter,
    Announcements,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    getInterviewFlow,
    getCandidates,
    updateCandidateStage,
    InterviewFlowResponse,
    Candidate
} from '../services/positionService';
import './PositionDetail.css';

import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

/**
 * Skeleton loader for candidate cards
 */
const SkeletonCard: React.FC = () => (
    <div className="candidate-card skeleton-card" aria-hidden="true">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-score"></div>
    </div>
);

/**
 * Skeleton loader for column
 */
const SkeletonColumn: React.FC = () => (
    <div className="kanban-column skeleton-column">
        <div className="kanban-column-header" style={{ backgroundColor: '#cbd5e1' }}>
            <div className="skeleton skeleton-column-title"></div>
            <div className="skeleton skeleton-count"></div>
        </div>
        <div className="kanban-column-content">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
        </div>
    </div>
);

/**
 * Loading state with skeleton screens
 */
const LoadingState: React.FC = () => (
    <div className="position-detail-wrapper">
        <header className="position-detail-header">
            <div className="header-content">
                <div className="skeleton skeleton-back-button"></div>
                <div className="skeleton skeleton-header-title"></div>
                <div className="header-spacer"></div>
            </div>
        </header>
        <div className="position-detail-content">
            <div className="position-description-container">
                <div className="skeleton skeleton-description"></div>
            </div>
            <div className="kanban-board">
                <SkeletonColumn />
                <SkeletonColumn />
                <SkeletonColumn />
                <SkeletonColumn />
            </div>
        </div>
    </div>
);

/**
 * Generate a color for a step based on its index
 * Uses a gradient from blue to green through purple
 */
const getStepColor = (index: number, total: number): string => {
    const colors = [
        '#3b82f6', // blue-500
        '#8b5cf6', // violet-500
        '#a855f7', // purple-500
        '#ec4899', // pink-500
        '#f43f5e', // rose-500
        '#10b981', // emerald-500
        '#14b8a6', // teal-500
    ];
    
    // If we have more steps than colors, cycle through them
    return colors[index % colors.length];
};

/**
 * Draggable Candidate Card Component
 */
interface DraggableCandidateCardProps {
    candidate: Candidate;
}

const DraggableCandidateCard: React.FC<DraggableCandidateCardProps> = ({ candidate }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: candidate.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`candidate-card ${isDragging ? 'dragging' : ''}`}
            {...attributes}
            {...listeners}
            role="button"
            aria-label={`Candidato ${candidate.fullName}. ${
                candidate.averageScore > 0 
                    ? `Puntuación ${candidate.averageScore.toFixed(1)}` 
                    : 'Sin evaluar'
            }. Presione barra espaciadora para recoger y mover entre columnas.`}
            tabIndex={0}
        >
            <h4 className="candidate-name">{candidate.fullName}</h4>
            <div className="candidate-score">
                {candidate.averageScore > 0 ? (
                    <>
                        <span className="score-icon" aria-hidden="true">⭐</span>
                        <span className="score-value">{candidate.averageScore.toFixed(1)}</span>
                    </>
                ) : (
                    <span className="score-unevaluated">Sin evaluar</span>
                )}
            </div>
        </div>
    );
};

/**
 * Droppable Column Component
 */
interface DroppableColumnProps {
    stepId: number;
    stepName: string;
    stepColor: string;
    candidates: Candidate[];
    isOver: boolean;
    isDisabled?: boolean;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({
    stepId,
    stepName,
    stepColor,
    candidates,
    isOver,
    isDisabled = false,
}) => {
    const { setNodeRef } = useDroppable({ id: stepId, disabled: isDisabled });

    return (
        <div 
            className={`kanban-column ${isDisabled ? 'column-disabled' : ''}`}
            role="region"
            aria-label={`Columna ${stepName}, ${candidates.length} candidato${candidates.length !== 1 ? 's' : ''}`}
        >
            {/* Column Header */}
            <div 
                className="kanban-column-header"
                style={{ backgroundColor: stepColor }}
            >
                <h3 className="kanban-column-title">{stepName}</h3>
                <span 
                    className="kanban-column-count"
                    aria-label={`${candidates.length} candidato${candidates.length !== 1 ? 's' : ''}`}
                >
                    {candidates.length}
                </span>
            </div>

            {/* Drop Area for Cards */}
            <div
                ref={setNodeRef}
                className={`kanban-column-content ${isOver ? 'drag-over' : ''}`}
                aria-label={isOver ? `Zona de soltar para ${stepName}` : undefined}
            >
                <SortableContext
                    items={candidates.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {candidates.map(candidate => (
                        <DraggableCandidateCard
                            key={candidate.id}
                            candidate={candidate}
                        />
                    ))}
                </SortableContext>
                {candidates.length === 0 && (
                    <div 
                        className="empty-column-placeholder"
                        aria-live="polite"
                    >
                        {isOver ? (
                            <div className="empty-state-drop">
                                <span className="empty-icon">📥</span>
                                <span>Soltar aquí</span>
                            </div>
                        ) : (
                            <div className="empty-state-default">
                                <span className="empty-icon">👤</span>
                                <span>Sin candidatos</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const PositionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // State management
    const [interviewFlow, setInterviewFlow] = useState<InterviewFlowResponse | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    
    // Drag & Drop state
    const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
    const [overId, setOverId] = useState<string | null>(null);
    
    // Toast notifications
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success');

    // Configure sensors for drag & drop
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Minimum distance to start dragging
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: (event, { currentCoordinates }) => {
                // Custom keyboard navigation
                return currentCoordinates;
            },
        })
    );

    // Accessibility announcements for screen readers
    const announcements: Announcements = {
        onDragStart({ active }) {
            const candidate = candidates.find(c => c.id === active.id);
            return candidate 
                ? `Recogido ${candidate.fullName}. Use las flechas del teclado para mover entre columnas.`
                : 'Recogido';
        },
        onDragOver({ active, over }) {
            if (!over || !interviewFlow) return '';
            
            const candidate = candidates.find(c => c.id === active.id);
            const targetStep = interviewFlow.interviewFlow.interviewSteps.find(
                step => step.id === over.id
            );

            if (candidate && targetStep) {
                return `${candidate.fullName} sobre la columna ${targetStep.name}`;
            }
            return '';
        },
        onDragEnd({ active, over }) {
            if (!over || !interviewFlow) {
                const candidate = candidates.find(c => c.id === active.id);
                return candidate 
                    ? `${candidate.fullName} fue soltado y regresado a su posición original`
                    : 'Soltado';
            }

            const candidate = candidates.find(c => c.id === active.id);
            const targetStep = interviewFlow.interviewFlow.interviewSteps.find(
                step => step.id === over.id
            );

            if (candidate && targetStep) {
                if (candidate.currentInterviewStep === targetStep.name) {
                    return `${candidate.fullName} permanece en ${targetStep.name}`;
                }
                return `${candidate.fullName} fue movido a ${targetStep.name}`;
            }
            return 'Soltado';
        },
        onDragCancel({ active }) {
            const candidate = candidates.find(c => c.id === active.id);
            return candidate 
                ? `Movimiento cancelado. ${candidate.fullName} regresado a su posición original`
                : 'Movimiento cancelado';
        },
    };

    // Load position data function
    const loadPositionData = async () => {
        // Validate position ID
        if (!id) {
            setError('No se proporcionó un ID de posición válido');
            setLoading(false);
            return;
        }

        const positionId = parseInt(id);
        if (isNaN(positionId) || positionId <= 0) {
            setError('El ID de posición proporcionado no es válido');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Fetch interview flow and candidates in parallel
            const [flowData, candidatesData] = await Promise.all([
                getInterviewFlow(positionId),
                getCandidates(positionId)
            ]);

            // Validate responses
            if (!flowData || !flowData.interviewFlow) {
                throw new Error('La respuesta del servidor no contiene un flujo de entrevistas válido');
            }

            if (!flowData.interviewFlow.interviewSteps || flowData.interviewFlow.interviewSteps.length === 0) {
                throw new Error('El flujo de entrevistas no tiene pasos configurados');
            }

            if (!Array.isArray(candidatesData)) {
                throw new Error('La respuesta del servidor no contiene una lista válida de candidatos');
            }

            setInterviewFlow(flowData);
            setCandidates(candidatesData);
        } catch (err: any) {
            console.error('Error loading position data:', err);
            
            // Provide specific error messages based on error type
            if (err.response?.status === 404) {
                setError('La posición solicitada no existe o no tiene un flujo de entrevistas configurado.');
            } else if (err.response?.status === 500) {
                setError('Error del servidor al cargar los datos. Por favor, contacte al administrador del sistema.');
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Error al cargar los datos de la posición. Verifique su conexión a internet e intente nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        loadPositionData();
    }, [id]);

    // Drag & Drop handlers
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const candidate = candidates.find(c => c.id === active.id);
        if (candidate) {
            setActiveCandidate(candidate);
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { over } = event;
        setOverId(over ? String(over.id) : null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        
        // Reset drag state
        setActiveCandidate(null);
        setOverId(null);

        if (!over || !interviewFlow) {
            return;
        }

        const candidateId = active.id as number;
        const targetStepId = over.id as number;

        // Find candidate and target step
        const candidate = candidates.find(c => c.id === candidateId);
        const targetStep = interviewFlow.interviewFlow.interviewSteps.find(
            step => step.id === targetStepId
        );

        if (!candidate || !targetStep) {
            return;
        }

        // Check if the candidate is already in this step
        if (candidate.currentInterviewStep === targetStep.name) {
            return;
        }

        // Store previous state for rollback
        const previousCandidates = [...candidates];

        // Optimistic update
        const updatedCandidates = candidates.map(c =>
            c.id === candidateId
                ? { ...c, currentInterviewStep: targetStep.name }
                : c
        );
        setCandidates(updatedCandidates);

        // Set updating state to disable drag & drop
        setIsUpdating(true);

        try {
            // Call API to update candidate stage
            await updateCandidateStage(candidateId, {
                applicationId: candidate.applicationId,
                currentInterviewStep: targetStepId,
            });

            // Show success notification
            setToastMessage(`${candidate.fullName} movido a ${targetStep.name}`);
            setToastVariant('success');
            setShowToast(true);
        } catch (error: any) {
            console.error('Error updating candidate stage:', error);
            
            // Rollback on error
            setCandidates(previousCandidates);
            
            // Provide specific error message
            let errorMsg = 'Error al mover el candidato. ';
            if (error.response?.status === 404) {
                errorMsg += 'El candidato o la etapa no existe.';
            } else if (error.response?.status === 400) {
                errorMsg += 'La solicitud es inválida.';
            } else if (error.response?.status === 500) {
                errorMsg += 'Error del servidor.';
            } else {
                errorMsg += 'Por favor, intente nuevamente.';
            }
            
            // Show error notification
            setToastMessage(errorMsg);
            setToastVariant('danger');
            setShowToast(true);
        } finally {
            // Re-enable drag & drop
            setIsUpdating(false);
        }
    };

    const handleDragCancel = () => {
        setActiveCandidate(null);
        setOverId(null);
    };

    // Loading state with skeleton
    if (loading) {
        return <LoadingState />;
    }

    // Error state with retry
    if (error) {
        return (
            <div className="position-detail-wrapper">
                <div className="error-container">
                    <Alert variant="danger">
                        <div className="error-icon">⚠️</div>
                        <Alert.Heading>Error al cargar la posición</Alert.Heading>
                        <p className="error-message">{error}</p>
                        <div className="error-actions">
                            <Button 
                                variant="danger" 
                                onClick={loadPositionData}
                                className="me-2"
                            >
                                🔄 Reintentar
                            </Button>
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => navigate('/positions')}
                            >
                                ← Volver a posiciones
                            </Button>
                        </div>
                    </Alert>
                </div>
            </div>
        );
    }

    // No data state
    if (!interviewFlow) {
        return (
            <div className="position-detail-wrapper">
                <div className="error-container">
                    <Alert variant="warning">
                        <div className="error-icon">📭</div>
                        <Alert.Heading>No se encontraron datos</Alert.Heading>
                        <p className="error-message">No se pudo cargar la información de la posición.</p>
                        <div className="error-actions">
                            <Button 
                                variant="warning" 
                                onClick={loadPositionData}
                                className="me-2"
                            >
                                🔄 Reintentar
                            </Button>
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => navigate('/positions')}
                            >
                                ← Volver a posiciones
                            </Button>
                        </div>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={isUpdating ? undefined : handleDragStart}
            onDragOver={isUpdating ? undefined : handleDragOver}
            onDragEnd={isUpdating ? undefined : handleDragEnd}
            onDragCancel={handleDragCancel}
            accessibility={{ announcements }}
        >
            <div className="position-detail-wrapper">
                {/* Updating Overlay */}
                {isUpdating && (
                    <div className="updating-overlay">
                        <div className="updating-spinner">
                            <Spinner animation="border" variant="primary" />
                            <span className="updating-text">Actualizando candidato...</span>
                        </div>
                    </div>
                )}

                {/* Sticky Header */}
                <header className="position-detail-header">
                    <div className="header-content">
                        <button 
                            className="back-button"
                            onClick={() => navigate('/positions')}
                            aria-label="Volver a posiciones"
                            disabled={isUpdating}
                        >
                            <span className="back-arrow">←</span>
                        </button>
                        <h1 className="position-title">{interviewFlow.positionName}</h1>
                        <div className="header-spacer"></div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="position-detail-content">
                    {/* Position Description */}
                    {interviewFlow.interviewFlow.description && (
                        <div className="position-description-container">
                            <p className="position-description">
                                {interviewFlow.interviewFlow.description}
                            </p>
                        </div>
                    )}

                    {/* Empty state when no candidates */}
                    {candidates.length === 0 ? (
                        <div className="empty-position-state">
                            <div className="empty-state-icon">👥</div>
                            <h3 className="empty-state-title">No hay candidatos en esta posición</h3>
                            <p className="empty-state-description">
                                Aún no se han agregado candidatos a esta posición. 
                                Los candidatos que se agreguen aparecerán aquí organizados por etapa.
                            </p>
                            <Button 
                                variant="primary" 
                                onClick={() => navigate('/positions')}
                                className="mt-3"
                            >
                                Ver todas las posiciones
                            </Button>
                        </div>
                    ) : (
                        /* Kanban Board */
                        <div className={`kanban-board ${isUpdating ? 'board-disabled' : ''}`}>
                            {interviewFlow.interviewFlow.interviewSteps
                                .sort((a, b) => a.orderIndex - b.orderIndex)
                                .map((step, index) => {
                                    // Filter candidates in this step
                                    const candidatesInStep = candidates.filter(
                                        candidate => candidate.currentInterviewStep === step.name
                                    );

                                    // Generate color based on step order
                                    const stepColor = getStepColor(index, interviewFlow.interviewFlow.interviewSteps.length);

                                    return (
                                        <DroppableColumn
                                            key={step.id}
                                            stepId={step.id}
                                            stepName={step.name}
                                            stepColor={stepColor}
                                            candidates={candidatesInStep}
                                            isOver={overId === String(step.id)}
                                            isDisabled={isUpdating}
                                        />
                                    );
                                })}
                        </div>
                    )}
                </div>

                {/* Toast Notifications */}
                <ToastContainer position="top-end" className="p-3">
                    <Toast 
                        show={showToast} 
                        onClose={() => setShowToast(false)}
                        delay={3000}
                        autohide
                        bg={toastVariant}
                    >
                        <Toast.Header>
                            <strong className="me-auto">
                                {toastVariant === 'success' ? 'Éxito' : 'Error'}
                            </strong>
                        </Toast.Header>
                        <Toast.Body className={toastVariant === 'success' ? 'text-white' : ''}>
                            {toastMessage}
                        </Toast.Body>
                    </Toast>
                </ToastContainer>

                {/* Drag Overlay */}
                <DragOverlay>
                    {activeCandidate ? (
                        <div className="candidate-card dragging-overlay">
                            <h4 className="candidate-name">{activeCandidate.fullName}</h4>
                            <div className="candidate-score">
                                {activeCandidate.averageScore > 0 ? (
                                    <>
                                        <span className="score-icon">⭐</span>
                                        <span className="score-value">{activeCandidate.averageScore.toFixed(1)}</span>
                                    </>
                                ) : (
                                    <span className="score-unevaluated">Sin evaluar</span>
                                )}
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
};

export default PositionDetail;
