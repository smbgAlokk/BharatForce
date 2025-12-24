
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Offer } from '../../types';
import { ArrowLeft, Save } from 'lucide-react';

export const OfferForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get('candidateId');
  
  const { candidates, jobPositions, employees, currentUser, currentTenant, addOffer } = useApp();
  
  const candidate = candidates.find(c => c.id === candidateId);
  const position = candidate ? jobPositions.find(p => p.id === candidate.jobPositionId) : null;
  
  const [formData, setFormData] = useState<Partial<Offer>>({
    companyId: currentTenant?.id,
    status: 'Draft',
    joiningBonus: 0,
    variablePay: 0
  });

  useEffect(() => {
    if (candidate && position) {
      setFormData(prev => ({
        ...prev,
        candidateId: candidate.id,
        jobPositionId: position.id,
        hiringManagerId: position.hiringManagerId,
        recruiterId: currentUser.id
      }));
    }
  }, [candidate, position, currentUser]);

  if (!candidate || !position) return <div className="p-6">Invalid Candidate or Position</div>;

  const handleChange = (field: keyof Offer, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newOffer: Offer = {
      ...formData as Offer,
      id: `off-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
      // Generate simple letter content placeholder
      letterContent: `Dear ${candidate.firstName},\n\nWe are pleased to offer you the position of ${position.title} at ${currentTenant?.name}.\n\nYour annual CTC will be ₹${formData.ctc}.\n\nPlease join us by ${formData.joiningDate}.\n\nSincerely,\nHR Team`
    };
    
    addOffer(newOffer);
    navigate(`/recruitment/offers/${newOffer.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
       <div className="flex items-center justify-between">
         <button onClick={() => navigate(-1)} className="flex items-center text-sm text-slate-500 hover:text-slate-700">
           <ArrowLeft className="w-4 h-4 mr-1" /> Back
         </button>
         <h2 className="text-xl font-bold text-slate-900">Create Offer</h2>
       </div>

       <form onSubmit={handleSave} className="bg-white shadow rounded-lg border border-slate-200 p-6 space-y-6">
          <div className="bg-slate-50 p-4 rounded border border-slate-200 flex justify-between items-center">
             <div>
                <div className="text-sm text-slate-500 uppercase">Candidate</div>
                <div className="font-bold text-slate-900">{candidate.firstName} {candidate.lastName}</div>
             </div>
             <div className="text-right">
                <div className="text-sm text-slate-500 uppercase">Position</div>
                <div className="font-bold text-indigo-600">{position.title}</div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-medium text-slate-700">Offer Date</label>
               <input 
                  type="date" required
                  className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
                  value={formData.offerDate || ''}
                  onChange={e => handleChange('offerDate', e.target.value)}
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700">Offer Valid Till</label>
               <input 
                  type="date" required
                  className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
                  value={formData.validTillDate || ''}
                  onChange={e => handleChange('validTillDate', e.target.value)}
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700">Joining Date</label>
               <input 
                  type="date" required
                  className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
                  value={formData.joiningDate || ''}
                  onChange={e => handleChange('joiningDate', e.target.value)}
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700">Annual CTC (₹)</label>
               <input 
                  type="number" required
                  className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
                  value={formData.ctc || ''}
                  onChange={e => handleChange('ctc', parseFloat(e.target.value))}
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700">Fixed Pay (Annual)</label>
               <input 
                  type="number" required
                  className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
                  value={formData.fixedPay || ''}
                  onChange={e => handleChange('fixedPay', parseFloat(e.target.value))}
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700">Variable Pay (Annual)</label>
               <input 
                  type="number" 
                  className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
                  value={formData.variablePay || 0}
                  onChange={e => handleChange('variablePay', parseFloat(e.target.value))}
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700">Joining Bonus (One-time)</label>
               <input 
                  type="number" 
                  className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
                  value={formData.joiningBonus || 0}
                  onChange={e => handleChange('joiningBonus', parseFloat(e.target.value))}
               />
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700">Internal Notes</label>
             <textarea 
               rows={3}
               className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
               value={formData.notes || ''}
               onChange={e => handleChange('notes', e.target.value)}
             />
          </div>

          <div className="flex justify-end">
             <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                <Save className="w-4 h-4 mr-2" /> Create Draft Offer
             </button>
          </div>
       </form>
    </div>
  );
};
