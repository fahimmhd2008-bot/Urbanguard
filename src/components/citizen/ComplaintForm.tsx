'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Image as ImageIcon,
  Building,
} from 'lucide-react';
import { ComplaintCategory } from '@/types/civic';
import { classifyComplaint } from '@/lib/ai/classifier';
import { calculatePriorityScore } from '@/lib/ai/priorityScorer';
import { complaintService } from '@/lib/data/complaintService';
import { CivicMap } from '../map/CivicMap';
import { PriorityBadge } from '../common/PriorityBadge';
import { CategoryIcon } from '../common/CategoryIcon';

const CATEGORIES: ComplaintCategory[] = [
  'Roads',
  'Water and drainage',
  'Waste management',
  'Electricity and streetlights',
  'Public infrastructure',
  'Public safety',
  'Other',
];

export function ComplaintForm() {
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory | ''>('');
  const [locationName, setLocationName] = useState('North Avenue Metro Zone');
  const [latitude, setLatitude] = useState(12.9785);
  const [longitude, setLongitude] = useState(77.5912);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Live AI Pre-classification
  const [aiDetectedCategory, setAiDetectedCategory] = useState<ComplaintCategory | null>(null);
  const [aiConfidence, setAiConfidence] = useState<number>(0);
  const [aiDeptRecommendation, setAiDeptRecommendation] = useState<string>('');
  const [aiEstimatedPriority, setAiEstimatedPriority] = useState<{
    score: number;
    level: 'Critical' | 'High' | 'Medium' | 'Low';
  } | null>(null);

  // UI Flow State
  const [submitting, setSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<{
    id: string;
    reference_number: string;
    priority_level: 'Critical' | 'High' | 'Medium' | 'Low';
    priority_score: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Live AI Assist hook on typing
  useEffect(() => {
    if (title.length > 5 || description.length > 10) {
      const result = classifyComplaint(title, description);
      setAiDetectedCategory(result.category);
      setAiConfidence(result.confidence);
      setAiDeptRecommendation(result.recommendedDepartment);

      const prio = calculatePriorityScore({
        title,
        description,
        category: category || result.category,
        locationName,
      });
      setAiEstimatedPriority({ score: prio.total_score, level: prio.level });
    } else {
      setAiDetectedCategory(null);
      setAiEstimatedPriority(null);
    }
  }, [title, description, category, locationName]);

  const handleApplyAiCategory = () => {
    if (aiDetectedCategory) {
      setCategory(aiDetectedCategory);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image file size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setImageUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMapLocationPick = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setLocationName(`GPS Pin: [${lat.toFixed(4)}, ${lng.toFixed(4)}]`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || title.length < 5) {
      setErrorMsg('Please enter a descriptive complaint title (at least 5 characters).');
      return;
    }
    if (!description.trim() || description.length < 15) {
      setErrorMsg('Please provide detailed information in the description (at least 15 characters).');
      return;
    }
    if (!locationName.trim()) {
      setErrorMsg('Please specify the incident location or choose a map coordinate.');
      return;
    }

    try {
      setSubmitting(true);
      const chosenCategory = (category || aiDetectedCategory || 'Other') as ComplaintCategory;

      const created = await complaintService.createComplaint({
        title,
        description,
        category: chosenCategory,
        location_name: locationName,
        latitude,
        longitude,
        image_url: imageUrl || imagePreview || undefined,
      });

      setSubmittedComplaint({
        id: created.id,
        reference_number: created.reference_number,
        priority_level: created.priority_level,
        priority_score: created.priority_score,
      });
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred during submission. Your complaint could not be saved.');
    } finally {
      setSubmitting(false);
    }
  };

  // Success Confirmation Screen
  if (submittedComplaint) {
    return (
      <div className="bg-[#0f172a]/90 rounded-3xl border border-white/15 p-8 sm:p-12 shadow-2xl max-w-2xl mx-auto text-center backdrop-blur-2xl animate-in zoom-in-95 duration-200 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/70 px-3.5 py-1 rounded-full border border-emerald-500/30">
            Official Complaint Registered
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-3">
            Incident Transmitted to Municipal Triage
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto leading-relaxed">
            Your report has been analyzed by the CivicAI Decision Engine, assigned an immutable tracking reference, and queued for departmental assignment.
          </p>
        </div>

        {/* Reference Callout Card */}
        <div className="p-6 bg-[#090d16]/80 rounded-2xl border border-white/10 text-left space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs text-slate-400 font-medium">Tracking Reference</span>
            <span className="font-mono text-base font-extrabold text-cyan-300 bg-cyan-950/60 px-3.5 py-1 rounded-xl border border-cyan-500/30">
              {submittedComplaint.reference_number}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Current Status</span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              SUBMITTED
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">AI Priority Assessment</span>
            <PriorityBadge
              level={submittedComplaint.priority_level}
              score={submittedComplaint.priority_score}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => router.push(`/track/${submittedComplaint.id}`)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all border border-cyan-400/30"
          >
            Track My Complaint Live <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSubmittedComplaint(null);
              setTitle('');
              setDescription('');
              setImageUrl('');
              setImagePreview(null);
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-sm border border-white/10 transition-colors"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#0f172a]/80 rounded-3xl border border-white/10 p-6 sm:p-10 shadow-2xl backdrop-blur-xl"
    >
      <div className="mb-8">
        <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 px-3 py-0.5 rounded-full border border-cyan-500/30">
          Citizen Portal
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
          Report a Public Infrastructure Issue
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Provide complete incident details. Our AI engine will auto-classify the hazard and calculate urgency.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Incident Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Dangerous 2-foot deep road crater near Metro Pillar 42"
            className="w-full px-4 py-3 rounded-xl bg-[#090d16]/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Detailed Description <span className="text-rose-400">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what occurred, what public hazards exist, and whether pedestrians or vehicles are actively obstructed..."
            className="w-full px-4 py-3 rounded-xl bg-[#090d16]/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all leading-relaxed"
          />
        </div>

        {/* Live AI Assist Suggestion Bar */}
        {aiDetectedCategory && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/70 to-indigo-950/70 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 text-xs backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
              <div>
                <span className="text-slate-300 font-medium">AI Detected Category: </span>
                <span className="font-bold text-cyan-300">{aiDetectedCategory}</span>
                <span className="text-slate-400 ml-1.5 font-mono">
                  ({Math.round(aiConfidence * 100)}% confidence)
                </span>
                {aiDeptRecommendation && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Recommended Dept: <span className="text-indigo-300 font-medium">{aiDeptRecommendation}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {aiEstimatedPriority && (
                <PriorityBadge
                  level={aiEstimatedPriority.level}
                  score={aiEstimatedPriority.score}
                  size="sm"
                />
              )}
              {category !== aiDetectedCategory && (
                <button
                  type="button"
                  onClick={handleApplyAiCategory}
                  className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] tracking-wide transition-colors shadow-md shadow-cyan-600/30"
                >
                  Apply Category
                </button>
              )}
            </div>
          </div>
        )}

        {/* Category Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Select Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`p-3 rounded-xl border text-left flex items-center gap-2 text-xs font-semibold transition-all duration-200 ${
                  category === cat
                    ? 'border-cyan-500/60 bg-gradient-to-r from-blue-900/60 to-cyan-900/60 text-cyan-200 shadow-md shadow-cyan-900/30'
                    : 'border-white/10 hover:border-white/20 text-slate-300 bg-[#090d16]/60 hover:bg-white/5'
                }`}
              >
                <CategoryIcon category={cat} className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Location Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Location & Coordinates <span className="text-rose-400">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowMapPicker(!showMapPicker)}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1.5 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              {showMapPicker ? 'Hide Interactive Map' : 'Select on Interactive Map'}
            </button>
          </div>

          <input
            type="text"
            required
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="e.g. North Avenue, Corner of 4th Cross"
            className="w-full px-4 py-3 rounded-xl bg-[#090d16]/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
          />

          {showMapPicker && (
            <div className="mt-3 p-3 rounded-2xl bg-[#090d16] border border-white/10">
              <p className="text-xs text-slate-400 mb-2">
                Click anywhere on the map to pin exact GPS incident coordinates:
              </p>
              <CivicMap
                complaints={[]}
                isPickerMode={true}
                onPickLocation={handleMapLocationPick}
                height="280px"
              />
              <div className="mt-2.5 text-xs text-cyan-300 font-mono">
                Selected GPS: {latitude.toFixed(5)}, {longitude.toFixed(5)}
              </div>
            </div>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Supporting Photographic Evidence
          </label>

          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-white/10 max-h-56 bg-slate-950 flex items-center justify-center">
              <img src={imagePreview} alt="Upload preview" className="object-cover max-h-56 w-full" />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setImageUrl('');
                }}
                className="absolute top-3 right-3 px-3 py-1.5 bg-black/80 hover:bg-black text-white text-xs rounded-xl backdrop-blur-md font-semibold border border-white/20"
              >
                Remove Photo
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-white/10 hover:border-cyan-500/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-[#090d16]/50 hover:bg-cyan-950/20 group">
              <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-cyan-400 mb-2 transition-colors" />
              <span className="text-xs font-semibold text-slate-200">
                Click to attach incident photo evidence
              </span>
              <span className="text-[11px] text-slate-400 mt-1">PNG, JPG, WebP up to 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2.5 disabled:opacity-70 cursor-pointer border border-cyan-400/30"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                Analyzing Incident & Dispatching to Municipal Triage...
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-cyan-200" />
                Submit Official Civic Complaint
              </>
            )}
          </button>
          <p className="text-[11px] text-slate-400 text-center mt-3">
            Every submission is logged into the audit ledger and assigned an immutable tracking reference.
          </p>
        </div>
      </div>
    </form>
  );
}
