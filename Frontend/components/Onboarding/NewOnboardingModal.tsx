
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { OnboardingRecord, OnboardingStatus, OfferStatus } from '../../types';
import { X, UserCheck, Briefcase, Calendar } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const NewOnboardingModal: React.FC<Props> = ({ onClose }) => {
  const navigate = useNavigate();
  const { 
    candidates, offers, jobPositions, onboardingRecords, currentTenant, 
    addOnboarding, currentUser 
  } = useApp();

  const [selectedOfferId, setSelectedOfferId] = useState<string>('');
  const [formData, setFormData] = useState<Partial<OnboardingRecord>>({
    status: OnboardingStatus.PLANNED,
    probationPeriod: 6
  });

  // Filter candidates/offers eligible for onboarding
  // 1. Must belong to current tenant
  // 2. Offer status must be 'Accepted'
  // 3. Must NOT already have an onboarding record
  const eligibleOffers = offers.filter(offer => {
    if (offer.companyId !== currentTenant?.id) return false;
    if (offer.status !== 'Accepted') return false;
    
    const alreadyOnboarding = onboardingRecords.some(r => r.offerId === offer.id);
    if (alreadyOnboarding) return false;

    return true;
  });

  // Pre-fill data when offer is selected
  useEffect(() => {
    if (selectedOfferId) {
      const offer = offers.find(o => o.id === selectedOfferId);
      const candidate = candidates.find(c => c.id === offer?.candidateId);
      const position = jobPositions.find(p => p.id === offer?.jobPositionId);

      if (offer && position) {
        setFormData({
          companyId: currentTenant?.id,
          candidateId: offer.candidateId,
          jobPositionId: offer.jobPositionId,
          offerId: offer.id,
          hiringManagerId: offer.hiringManagerId,
          tentativeDoj: offer.joiningDate,
          branchId: position.branchId,
          employmentType: position.employmentType,
          workLocationType: 'Onsite', // Default, can be editable
          probationPeriod: 6, // Default
          status: OnboardingStatus.PLANNED
        });
      }
    }
  }, [selectedOfferId, offers, candidates, jobPositions, currentTenant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfferId || !formData.candidateId) return;

    const newRecord: OnboardingRecord = {
       ...formData as OnboardingRecord,
       id: `onb-${Date.now()}`,
       tasks: [
          { id: `t-1`, group: 'HR Checklist', title: 'Verify Documents', assignedToRole: 'HR', status: 'Pending' },
          { id: `t-2`, group: 'IT Checklist', title: 'Prepare Laptop', assignedToRole: 'IT', status: 'Pending' },
          { id: `t-3`, group: 'Manager Checklist', title: 'Team Introduction', assignedToRole: 'Manager', status: 'Pending' },
       ],
       createdAt: new Date().toISOString(),
       createdBy: currentUser.name
    };

    addOnboarding(newRecord);
    onClose();
    navigate(`/onboarding/${newRecord.id}`);
  };

  const selectedOffer = offers.find(o => o.id === selectedOfferId);
  const selectedCandidate = candidates.find(c => c.id === selectedOffer?.candidateId);
  const selectedPosition = jobPositions.find(p => p.id === selectedOffer?.jobPositionId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900">Initiate Onboarding</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
        </div>

        {eligibleOffers.length === 0 ? (
           <div className="text-center py-8 text-slate-500">
              <UserCheck className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p>No candidates found with "Accepted" offers pending onboarding.</p>
              <button onClick={onClose} className="mt-4 text-indigo-600 font-medium hover:underline">Close</button>
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">Select Candidate (Accepted Offer)</label>
               <select 
                 required
                 className="block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
                 value={selectedOfferId}
                 onChange={e => setSelectedOfferId(e.target.value)}
               >
                  <option value="">-- Select Candidate --</option>
                  {eligibleOffers.map(offer => {
                     const cand = candidates.find(c => c.id === offer.candidateId);
                     const pos = jobPositions.find(p => p.id === offer.jobPositionId);
                     return (
                        <option key={offer.id} value={offer.id}>
                           {cand?.firstName} {cand?.lastName} - {pos?.title}
                        </option>
                     );
                  })}
               </select>
            </div>

            {selectedOffer && (
               <div className="bg-slate-50 rounded-md p-4 border border-slate-200 space-y-3 text-sm">
                  <div className="flex items-center text-slate-700">
                     <UserCheck className="w-4 h-4 mr-2 text-slate-400" />
                     <span className="font-medium">{selectedCandidate?.firstName} {selectedCandidate?.lastName}</span>
                  </div>
                  <div className="flex items-center text-slate-700">
                     <Briefcase className="w-4 h-4 mr-2 text-slate-400" />
                     <span>{selectedPosition?.title}</span>
                  </div>
                  <div className="flex items-center text-slate-700">
                     <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                     <span>Offer Joined Date: {selectedOffer.joiningDate}</span>
                  </div>
               </div>
            )}

            {selectedOffer && (
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Tentative DOJ</label>
                    <input 
                      type="date" required
                      className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 sm:text-sm"
                      value={formData.tentativeDoj || ''}
                      onChange={e => setFormData({...formData, tentativeDoj: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Probation (Months)</label>
                    <input 
                      type="number" required min="0"
                      className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 sm:text-sm"
                      value={formData.probationPeriod || 0}
                      onChange={e => setFormData({...formData, probationPeriod: parseInt(e.target.value)})}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Employment Type</label>
                    <input 
                      type="text" disabled
                      className="mt-1 block w-full border border-slate-300 bg-slate-100 rounded-md py-2 px-3 sm:text-sm text-slate-500"
                      value={formData.employmentType || ''}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Location Type</label>
                    <select 
                      className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 sm:text-sm"
                      value={formData.workLocationType || 'Onsite'}
                      onChange={e => setFormData({...formData, workLocationType: e.target.value as any})}
                    >
                       <option value="Onsite">Onsite</option>
                       <option value="Hybrid">Hybrid</option>
                       <option value="Remote">Remote</option>
                    </select>
                 </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
               <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
               <button 
                 type="submit" 
                 disabled={!selectedOffer}
                 className={`px-4 py-2 text-white rounded-md text-sm font-medium 
                    ${selectedOffer ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-300 cursor-not-allowed'}`}
               >
                 Start Onboarding
               </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
