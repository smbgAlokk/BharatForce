


import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { OfferStatus, OnboardingRecord, OnboardingStatus } from '../../types';
import { ArrowLeft, FileText, CheckCircle, XCircle, Send, Download, UserPlus } from 'lucide-react';

export const OfferDetail: React.FC = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const { offers, updateOffer, candidates, jobPositions, currentTenant, addOnboarding, onboardingRecords } = useApp();

  const offer = offers.find(o => o.id === id);
  
  if (!offer) return <div>Offer not found</div>;

  const candidate = candidates.find(c => c.id === offer.candidateId);
  const position = jobPositions.find(p => p.id === offer.jobPositionId);

  // Check if onboarding already exists
  const existingOnboarding = onboardingRecords.find(r => r.offerId === offer.id);

  const handleStatusChange = (status: OfferStatus) => {
    const updated = { ...offer, status };
    if (status === 'Accepted' || status === 'Rejected') {
       updated.responseDate = new Date().toISOString();
    }
    updateOffer(updated);
  };

  const handleStartOnboarding = () => {
    if (!currentTenant || !candidate || !position) return;
    
    const newRecord: OnboardingRecord = {
       id: `onb-${Date.now()}`,
       companyId: currentTenant.id,
       candidateId: candidate.id,
       jobPositionId: position.id,
       offerId: offer.id,
       hiringManagerId: offer.hiringManagerId,
       tentativeDoj: offer.joiningDate,
       branchId: position.branchId,
       workLocationType: 'Onsite', // Default
       employmentType: position.employmentType,
       probationPeriod: 6, // Default
       status: OnboardingStatus.PLANNED,
       tasks: [
          { id: `t-1`, group: 'HR Checklist', title: 'Verify Documents', assignedToRole: 'HR', status: 'Pending' },
          { id: `t-2`, group: 'IT Checklist', title: 'Prepare Laptop', assignedToRole: 'IT', status: 'Pending' },
       ],
       createdAt: new Date().toISOString(),
       createdBy: 'System'
    };

    addOnboarding(newRecord);
    navigate(`/onboarding/${newRecord.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
       <button onClick={() => navigate('/recruitment/offers')} className="flex items-center text-sm text-slate-500 hover:text-slate-700">
         <ArrowLeft className="w-4 h-4 mr-1" /> Back to Offers
       </button>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-white shadow rounded-lg border border-slate-200 p-6">
                <div className="flex justify-between items-start mb-6">
                   <div>
                      <h1 className="text-2xl font-bold text-slate-900">Offer for {candidate?.firstName} {candidate?.lastName}</h1>
                      <p className="text-slate-500 mt-1">{position?.title}</p>
                   </div>
                   <span className={`px-3 py-1 text-sm font-medium rounded-full 
                        ${offer.status === 'Accepted' ? 'bg-green-100 text-green-800' : 
                          offer.status === 'Sent' ? 'bg-blue-100 text-blue-800' : 
                          offer.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-slate-100 text-slate-800'}`}>
                        {offer.status}
                   </span>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                   <div className="bg-slate-50 p-4 rounded border border-slate-100">
                      <div className="text-xs text-slate-500 uppercase mb-1">Annual CTC</div>
                      <div className="text-xl font-bold text-slate-900">₹ {(offer.ctc).toLocaleString('en-IN')}</div>
                   </div>
                   <div className="bg-slate-50 p-4 rounded border border-slate-100">
                      <div className="text-xs text-slate-500 uppercase mb-1">Joining Date</div>
                      <div className="text-xl font-bold text-indigo-600">{new Date(offer.joiningDate).toLocaleDateString()}</div>
                   </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 uppercase mb-3">Compensation Breakdown</h3>
                <table className="min-w-full text-sm mb-6">
                   <tbody>
                      <tr className="border-b border-slate-100">
                         <td className="py-2 text-slate-600">Fixed Pay</td>
                         <td className="py-2 text-right font-medium">₹ {offer.fixedPay.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                         <td className="py-2 text-slate-600">Variable Pay</td>
                         <td className="py-2 text-right font-medium">₹ {offer.variablePay.toLocaleString('en-IN')}</td>
                      </tr>
                      {offer.joiningBonus ? (
                         <tr className="border-b border-slate-100">
                           <td className="py-2 text-slate-600">Joining Bonus</td>
                           <td className="py-2 text-right font-medium">₹ {offer.joiningBonus.toLocaleString('en-IN')}</td>
                        </tr>
                      ) : null}
                   </tbody>
                </table>
             </div>

             {/* Letter Preview */}
             <div className="bg-white shadow rounded-lg border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-bold text-slate-900">Offer Letter Preview</h3>
                   <button className="text-indigo-600 text-sm hover:underline flex items-center">
                      <Download className="w-4 h-4 mr-1" /> Download PDF
                   </button>
                </div>
                <div className="bg-slate-50 p-6 rounded border border-slate-200 font-mono text-sm whitespace-pre-wrap text-slate-700">
                   {offer.letterContent}
                </div>
             </div>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
             <div className="bg-white shadow rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase mb-4">Actions</h3>
                <div className="space-y-2">
                   {offer.status === 'Draft' && (
                      <button onClick={() => handleStatusChange('Sent')} className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                         <Send className="w-4 h-4 mr-2" /> Mark as Sent
                      </button>
                   )}
                   {offer.status === 'Sent' && (
                      <>
                        <button onClick={() => handleStatusChange('Accepted')} className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                           <CheckCircle className="w-4 h-4 mr-2" /> Mark Accepted
                        </button>
                         <button onClick={() => handleStatusChange('Rejected')} className="w-full flex items-center justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
                           <XCircle className="w-4 h-4 mr-2" /> Mark Rejected
                        </button>
                      </>
                   )}
                    {offer.status === 'Accepted' && !existingOnboarding && (
                       <button onClick={handleStartOnboarding} className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 animate-pulse">
                          <UserPlus className="w-4 h-4 mr-2" /> Start Onboarding
                       </button>
                    )}
                    {existingOnboarding && (
                       <div className="bg-indigo-50 text-indigo-700 p-2 rounded text-center text-sm font-medium">
                          Onboarding Started
                       </div>
                    )}
                    {['Rejected', 'Withdrawn', 'Expired'].includes(offer.status) && (
                       <div className="text-center text-sm text-slate-500 py-2">
                          Offer is {offer.status}
                       </div>
                    )}
                </div>
             </div>

             <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm space-y-3">
                <h4 className="font-bold text-slate-900">Metadata</h4>
                <div className="flex justify-between">
                   <span className="text-slate-500">Created By:</span>
                   <span>{offer.createdBy}</span>
                </div>
                 <div className="flex justify-between">
                   <span className="text-slate-500">Offer Date:</span>
                   <span>{offer.offerDate ? new Date(offer.offerDate).toLocaleDateString() : '-'}</span>
                </div>
                 <div className="flex justify-between">
                   <span className="text-slate-500">Valid Till:</span>
                   <span className="text-red-600">{new Date(offer.validTillDate).toLocaleDateString()}</span>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
