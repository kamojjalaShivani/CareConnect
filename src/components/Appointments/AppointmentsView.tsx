import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle,
  Star,
} from "lucide-react";
import {
  CareRequest,
  Assignment,
  Family,
  Provider,
  CareRequestMatches,
} from "../../types";
import { BackendApiService } from "../../services/backendApi";
import { format } from "date-fns";
import CareRequestModal from "./CareRequestModal";

interface AppointmentsViewProps {
  openNewRequestModal?: boolean;
}

export default function AppointmentsView({
  openNewRequestModal,
}: AppointmentsViewProps) {
  const [appointments, setAppointments] = useState<CareRequest[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [careRequestMatches, setCareRequestMatches] =
    useState<CareRequestMatches | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCareRequest, setSelectedCareRequest] =
    useState<CareRequest | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (openNewRequestModal) {
      setIsNewRequestModalOpen(true);
    }
  }, [openNewRequestModal]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [careRequestsData, assignmentsData, familiesData, providersData] =
        await Promise.all([
          BackendApiService.getCareRequests(),
          BackendApiService.getAssignments(),
          BackendApiService.getFamilies(),
          BackendApiService.getProviders(),
        ]);
      setAppointments(careRequestsData);
      setAssignments(assignmentsData);
      setFamilies(familiesData);
      setProviders(providersData);
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCareRequestMatches = async (requestId: string) => {
    try {
      const matches = await BackendApiService.getCareRequestMatches(requestId);
      setCareRequestMatches(matches);
    } catch (error) {
      console.error("Error fetching care request matches:", error);
      setCareRequestMatches(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "assigned":
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAssignProviderClick = (appointment: CareRequest) => {
    console.log("handleAssignProviderClick: selected appointment", appointment);
    setSelectedCareRequest(appointment);
    fetchCareRequestMatches(appointment.id);
    setIsEditModalOpen(true);
  };

  const handleViewDetailsClick = (appointment: CareRequest) => {
    console.log("handleViewDetailsClick: selected appointment", appointment);
    setSelectedCareRequest(appointment);
    fetchCareRequestMatches(appointment.id);
    setIsEditModalOpen(true);
  };

  const handleSaveCareRequest = async (
    careRequestData: Omit<CareRequest, "id" | "createdAt" | "updatedAt">,
    startTime?: string,
    endTime?: string,
    hoursPerDay?: number
  ): Promise<CareRequest | null> => {
    try {
      let savedRequest: CareRequest;
      if (selectedCareRequest) {
        // Update existing care request
        console.log(
          "handleSaveCareRequest: Updating care request",
          selectedCareRequest.id,
          careRequestData
        );

        if (
          selectedCareRequest.providerId === null &&
          careRequestData.providerId
        ) {
          // If a provider is newly assigned, create an assignment first
          console.log(
            "handleSaveCareRequest: Creating new assignment for care request",
            selectedCareRequest.id,
            "with provider",
            careRequestData.providerId
          );
          await BackendApiService.createAssignment({
            requestId: selectedCareRequest.id,
            providerId: careRequestData.providerId,
          });

          // Then update the care request status to 'assigned' and set providerId
          const updatedCareRequestPayload: Partial<CareRequest> = {
            ...careRequestData,
            providerId: careRequestData.providerId,
            status: "assigned",
          };
          savedRequest = await BackendApiService.updateCareRequest(
            selectedCareRequest.id,
            updatedCareRequestPayload
          );
        } else {
          // Otherwise, just update the care request
          console.log(
            "handleSaveCareRequest: Updating existing care request",
            selectedCareRequest.id,
            careRequestData
          );
          savedRequest = await BackendApiService.updateCareRequest(
            selectedCareRequest.id,
            careRequestData
          );
        }
      } else {
        // Create new care request
        console.log(
          "handleSaveCareRequest: Creating new care request",
          careRequestData
        );
        const newCareRequest = {
          ...careRequestData,
          status: "pending" as CareRequest["status"],
        };
        savedRequest = await BackendApiService.createCareRequest(
          newCareRequest
        );
      }

      loadInitialData(); // Reload all data to reflect changes
      return savedRequest;
    } catch (error) {
      console.error("Error saving care request:", error);
      return null;
    } finally {
      setIsNewRequestModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedCareRequest(null);
      setCareRequestMatches(null); // Clear matches when modal closes
    }
  };

  const handleCloseModal = () => {
    setIsNewRequestModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedCareRequest(null);
    setCareRequestMatches(null); // Clear matches when modal closes
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">
            Manage care appointments and scheduling
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === "list"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              } transition-colors`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 text-sm font-medium border-l border-gray-300 ${
                viewMode === "calendar"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              } transition-colors`}
            >
              Calendar
            </button>
          </div>
          <button
            onClick={() => setIsNewRequestModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Care Requests</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {appointments.map((appointment) => {
            const relatedAssignments = assignments.filter(
              (assignment) => assignment.requestId === appointment.id
            );
            return (
              <div
                key={appointment.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        {appointment.family?.name || "Unknown Family"}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {getStatusIcon(appointment.status)}
                        <span className="ml-1">{appointment.status}</span>
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                          appointment.priority
                        )}`}
                      >
                        {appointment.priority}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {format(
                          new Date(
                            `${appointment.startDate}T${appointment.startTime}`
                          ),
                          "MMM dd, yyyy"
                        )}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {format(
                          new Date(
                            `${appointment.startDate}T${appointment.startTime}`
                          ),
                          "h:mm a"
                        )}{" "}
                        -{" "}
                        {format(
                          new Date(
                            `${appointment.endDate}T${appointment.endTime}`
                          ),
                          "h:mm a"
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className="w-4 h-4 mr-2 text-xs">🏥</span>
                        {appointment.careType}
                      </div>
                    </div>

                    {appointment.provider && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-600">
                          Assigned to:{" "}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {appointment.provider.name}
                        </span>
                      </div>
                    )}

                    {appointment.notes && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          {appointment.notes}
                        </p>
                      </div>
                    )}

                    {appointment.requiresConsistency && (
                      <div className="mt-2 flex items-center text-sm text-amber-600">
                        <Star className="w-4 h-4 mr-1" />
                        Consistency required
                      </div>
                    )}

                  
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    {appointment.status === "pending" && (
                      <button
                        onClick={() => handleAssignProviderClick(appointment)}
                        className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Assign Provider
                      </button>
                    )}
                    <button
                      onClick={() => handleViewDetailsClick(appointment)}
                      className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {appointments.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No appointments scheduled
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first care request to get started.
            </p>
            <button
              onClick={() => setIsNewRequestModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Request
            </button>
          </div>
        )}
      </div>

      <CareRequestModal
        isOpen={isNewRequestModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCareRequest}
        title="Create New Care Request"
      />

      <CareRequestModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCareRequest}
        careRequest={selectedCareRequest}
        title="Edit Care Request"
      />
    </div>
  );
}
