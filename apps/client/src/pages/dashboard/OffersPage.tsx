import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stagger, StaggerItem } from '../../components/animations';
import { requirementsApi } from '../../lib/requirementsApi';
import type { Requirement, Offer } from '../../lib/requirementsApi';
import { useSearchParams, Link } from 'react-router-dom';
import { User, MessageSquare, IndianRupee, Star, CheckCircle, XCircle, ArrowLeft, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api'; // for actions

export default function OffersPage() {
  const [searchParams] = useSearchParams();
  const reqId = searchParams.get('req');

  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [selectedReq, setSelectedReq] = useState<string | null>(reqId);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoadingReqs, setIsLoadingReqs] = useState(true);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);

  useEffect(() => {
    fetchRequirements();
  }, []);

  useEffect(() => {
    if (selectedReq) {
      fetchOffers(selectedReq);
    } else {
      setOffers([]);
    }
  }, [selectedReq]);

  const fetchRequirements = async () => {
    setIsLoadingReqs(true);
    try {
      const res = await requirementsApi.getMine();
      const reqs = res.data.data.requirements || [];
      setRequirements(reqs);
      if (!selectedReq && reqs.length > 0) {
        setSelectedReq(reqs[0]._id);
      }
    } catch {
      toast.error('Failed to load requirements');
    } finally {
      setIsLoadingReqs(false);
    }
  };

  const fetchOffers = async (id: string) => {
    setIsLoadingOffers(true);
    try {
      const res = await requirementsApi.getOffersForRequirement(id);
      setOffers(res.data.data.offers || []);
    } catch {
      toast.error('Failed to load offers');
    } finally {
      setIsLoadingOffers(false);
    }
  };

  const handleAction = async (offerId: string, action: 'accept' | 'reject') => {
    try {
      // Assuming endpoint is POST /offers/:id/:action
      await api.post(`/requirements/offers/${offerId}/${action}`);
      toast.success(`Offer ${action}ed successfully`);
      fetchOffers(selectedReq!); // refresh
    } catch {
      toast.error(`Could not ${action} offer`);
    }
  };

  return (
    <div style={{ paddingBottom: 60, display: 'flex', gap: 24, height: 'calc(100vh - 100px)' }}>
      {/* Sidebar: List of Requirements */}
      <div style={{ width: 320, display: 'flex', flexDirection: 'column', background: 'white', borderRadius: 24, border: '1.5px solid var(--gray-100)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1.5px solid var(--gray-100)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Inbox size={20} className="text-indigo-600" /> Inbox
          </h2>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {isLoadingReqs ? (
             <div style={{ padding: 20, textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>
          ) : requirements.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--gray-400)', fontSize: '0.88rem' }}>No requirements posted yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {requirements.map(req => (
                <button
                  key={req._id}
                  onClick={() => setSelectedReq(req._id)}
                  style={{
                    padding: '16px', borderRadius: 16, border: '1.5px solid', cursor: 'pointer', textAlign: 'left',
                    borderColor: selectedReq === req._id ? 'var(--indigo)' : 'transparent',
                    background: selectedReq === req._id ? 'var(--lavender-soft)' : 'transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 4 }}>{req.subject}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{req.className}</span>
                    <span style={{ fontWeight: 600, color: req.offersReceived > 0 ? 'var(--indigo-deep)' : 'var(--gray-400)' }}>
                      {req.offersReceived} Offers
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Offers for selected req */}
      <div style={{ flex: 1, background: 'white', borderRadius: 24, border: '1.5px solid var(--gray-100)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!selectedReq ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)', flexDirection: 'column', gap: 12 }}>
            <Inbox size={48} />
            <p>Select a requirement to view its offers</p>
          </div>
        ) : (
          <>
            <div style={{ padding: '20px 24px', borderBottom: '1.5px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--gray-900)' }}>
                Tutor Offers
              </h2>
              <Link to="/my-requests">
                <button style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--gray-500)', cursor: 'pointer' }}>
                  <ArrowLeft size={14} /> Back to Requests
                </button>
              </Link>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: 'var(--gray-50)' }}>
              {isLoadingOffers ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>Loading offers...</div>
              ) : offers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                   <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)', margin: '0 auto 20px' }}>
                    <Users size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: 8 }}>No offers yet</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--gray-500)' }}>Tutors haven't submitted any proposals for this requirement.</p>
                </div>
              ) : (
                <Stagger stagger={0.08} delay={0.1} style={{ display: 'grid', gap: 16 }}>
                  {offers.map(offer => (
                    <StaggerItem key={offer._id}>
                      <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1.5px solid var(--gray-100)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                          <div style={{ display: 'flex', gap: 16 }}>
                            <div className="avatar" style={{ width: 56, height: 56, fontSize: '1.2rem', overflow: 'hidden' }}>
                               <img src={offer.tutor.avatar || `https://ui-avatars.com/api/?name=${offer.tutor.firstName}+${offer.tutor.lastName}`} alt="avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
                            </div>
                            <div>
                              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--gray-900)' }}>
                                {offer.tutor.firstName} {offer.tutor.lastName}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 4 }}>
                                <Star size={12} fill="#f59e0b" color="#f59e0b" /> 4.8 Rating
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '1.4rem', fontWeight: 800, color: 'var(--indigo-deep)' }}>
                              <IndianRupee size={18} strokeWidth={2.5} /> {offer.proposedRate}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Proposed Rate</div>
                          </div>
                        </div>

                        {offer.message && (
                          <div style={{ background: 'var(--gray-50)', padding: 16, borderRadius: 12, fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <MessageSquare size={16} className="text-gray-400" style={{ flexShrink: 0, marginTop: 2 }} />
                            <p style={{ margin: 0 }}>"{offer.message}"</p>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: 12, borderTop: '1.5px solid var(--gray-100)', paddingTop: 20 }}>
                          <button style={{ flex: 1, padding: '10px', borderRadius: 999, border: '1.5px solid var(--gray-200)', background: '#fff', fontSize: '0.88rem', fontWeight: 600, color: 'var(--gray-600)', cursor: 'pointer', transition: 'all 0.2s' }}
                           onClick={() => handleAction(offer._id, 'reject')}
                          >
                            Decline
                          </button>
                          <button style={{ flex: 1, padding: '10px', borderRadius: 999, border: 'none', background: 'var(--gray-900)', fontSize: '0.88rem', fontWeight: 600, color: '#fff', cursor: 'pointer', transition: 'all 0.2s' }}
                           onClick={() => handleAction(offer._id, 'accept')}
                          >
                            Accept Offer
                          </button>
                          <button style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'var(--lavender-soft)', color: 'var(--indigo-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <MessageSquare size={18} />
                          </button>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
