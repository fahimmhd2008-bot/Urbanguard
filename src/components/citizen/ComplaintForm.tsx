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
  Shield,
  Loader2,
  X,
  Copy,
  Check,
} from 'lucide-react';
import type { ComplaintCategory } from '@/types/civic';
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
  const [locationName, setLocationName] = useState('Central Avenue & Main Street');
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
  const [copiedRef, setCopiedRef] = useState(false);

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

  const copyReferenceNumber = () => {
    if (submittedComplaint) {
      navigator.clipboard.writeText(submittedComplaint.reference_number);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || title.length < 5) {
      setErrorMsg('Please enter a descriptive title for the issue (at least 5 characters).');
      return;
    }
    if (!description.trim() || description.length < 15) {
      setErrorMsg('Please provide enough details in the description (at least 15 characters).');
      return;
    }
    if (!locationName.trim()) {
      setErrorMsg('Please provide the location of the problem.');
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
    } catch {
      setErrorMsg('An error occurred during submission. Your complaint could not be saved.');
    } finally {
      setSubmitting(false);
    }
  };

  // Success Confirmation Screen
  if (submittedComplaint) {
    return (
      <div className="card-clean p-8 sm:p-12 max-w-xl mx-auto text-center space-y-6 bg-white border border-[#E5EAF0]">
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200 inline-block">
            Report Submitted Successfully
          </span>
          <h2 className="text-2xl font-extrabold text-[#183B66]">
            Incident Registered with Urbanguard
          </h2>
          <p className="text-xs text-[#718096] max-w-sm mx-auto leading-relaxed">
            Your complaint has been queued for municipal dispatch. Save your reference number to track its progress.
          </p>
        </div>

        {/* Reference Callout Card */}
        <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E5EAF0] text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#718096]">Complaint Reference</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-[#183B66]">
                {submittedComplaint.reference_number}
              </span>
              <button
                onClick={copyReferenceNumber}
                className="p-1 text-[#718096] hover:text-[#183B66] rounded hover:bg-[#E5EAF0] transition-colors"
                title="Copy reference number"
              >
                {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#E5EAF0] pt-2 text-xs">
            <span className="text-[#718096]">Current Status</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              SUBMITTED
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-[#E5EAF0] pt-2 text-xs">
            <span className="text-[#718096]">Calculated Priority</span>
            <PriorityBadge
              level={submittedComplaint.priority_level}
              score={submittedComplaint.priority_score}
              size="sm"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => router.push(`/track/${submittedComplaint.id}`)}
            className="w-full sm:w-auto btn-primary text-xs !py-2.5"
          >
            <span>Track Progress Live</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setSubmittedComplaint(null);
              setTitle('');
              setDescription('');
              setImageUrl('');
              setImagePreview(null);
            }}
            className="w-full sm:w-auto btn-secondary text-xs !py-2.5"
          >
            Report Another Issue
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card-clean p-6 sm:p-10 space-y-6 bg-white border border-[#E5EAF0]"
    >
      <div>
        <span className="text-xs font-bold text-[#3978C5] uppercase tracking-wider">
          Citizen Portal
        </span>
        <h2 className="text-2xl font-extrabold text-[#183B66] mt-1">
          Report a Civic Problem
        </h2>
        <p className="text-xs text-[#718096] mt-0.5">
          Please fill out the form below. Urbanguard will automatically categorize the issue and route it to the appropriate municipal department.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Field: Title */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-[#183B66]">
          Issue Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Deep pothole damaging vehicles on Main Street"
          className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E5EAF0] text-[#263445] placeholder-[#A0AEC0] text-sm focus:border-[#3978C5] focus:ring-1 focus:ring-[#3978C5] focus:outline-none transition-colors"
        />
        <p className="text-[11px] text-[#718096]">A short, clear summary of the problem.</p>
      </div>

      {/* Field: Description */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-[#183B66]">
          Description & Details <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what is broken or hazardous, when you first noticed it, and if it poses immediate safety concerns..."
          className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E5EAF0] text-[#263445] placeholder-[#A0AEC0] text-sm focus:border-[#3978C5] focus:ring-1 focus:ring-[#3978C5] focus:outline-none transition-colors leading-relaxed"
        />
        <p className="text-[11px] text-[#718096]">Provide enough details to help municipal work crews locate and repair the issue.</p>
      </div>

      {/* AI Assistant Suggestion Callout */}
      {aiDetectedCategory && (
        <div className="p-3.5 rounded-lg bg-[#EBF3FC] border border-[#D0E2F6] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#3978C5] shrink-0" />
            <div>
              <span className="text-[#183B66] font-semibold">AI Detected Category: </span>
              <span className="font-bold text-[#183B66]">{aiDetectedCategory}</span>
              <span className="text-[#718096] ml-1.5">
                ({Math.round(aiConfidence * 100)}% match)
              </span>
              {aiDeptRecommendation && (
                <span className="text-[#718096] block text-[11px]">
                  Suggested Department: <strong>{aiDeptRecommendation}</strong>
                </span>
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
                className="px-2.5 py-1 rounded bg-[#183B66] text-white font-semibold text-[11px] hover:bg-[#122d4f] transition-colors"
              >
                Apply
              </button>
            )}
          </div>
        </div>
      )}

      {/* Field: Category Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-[#183B66]">
          Category Selection
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`p-2.5 rounded-lg border text-left flex items-center gap-2 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'border-[#3978C5] bg-[#EBF3FC] text-[#183B66]'
                    : 'border-[#E5EAF0] text-[#718096] bg-white hover:border-[#CBD5E1] hover:text-[#263445]'
                }`}
              >
                <CategoryIcon category={cat} className="w-4 h-4 text-[#3978C5] shrink-0" />
                <span className="truncate">{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Field: Location */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#183B66]">
            Incident Location <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowMapPicker(!showMapPicker)}
            className="text-xs font-semibold text-[#3978C5] hover:text-[#183B66] inline-flex items-center gap-1 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{showMapPicker ? 'Hide Map' : 'Choose on Map'}</span>
          </button>
        </div>

        <input
          type="text"
          required
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="e.g. 124 Oak Street, near City Park entrance"
          className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E5EAF0] text-[#263445] placeholder-[#A0AEC0] text-sm focus:border-[#3978C5] focus:ring-1 focus:ring-[#3978C5] focus:outline-none transition-colors"
        />

        {showMapPicker && (
          <div className="mt-2 p-3 rounded-lg bg-[#F8FAFC] border border-[#E5EAF0] space-y-2">
            <p className="text-xs text-[#718096]">
              Click on the map to set the exact coordinates of the issue:
            </p>
            <CivicMap
              complaints={[]}
              isPickerMode={true}
              onPickLocation={handleMapLocationPick}
              height="260px"
            />
            <div className="text-xs text-[#183B66] font-mono">
              Coordinates: {latitude.toFixed(5)}, {longitude.toFixed(5)}
            </div>
          </div>
        )}
      </div>

      {/* Field: Image Upload */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-[#183B66]">
          Photo Evidence (Optional)
        </label>

        {imagePreview ? (
          <div className="relative rounded-lg overflow-hidden border border-[#E5EAF0] max-h-52 bg-[#F8FAFC] flex items-center justify-center">
            <img src={imagePreview} alt="Upload preview" className="object-cover max-h-52 w-full" />
            <button
              type="button"
              onClick={() => {
                setImagePreview(null);
                setImageUrl('');
              }}
              className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-[#263445] text-xs rounded-md shadow-sm border border-[#E5EAF0] font-semibold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="border border-dashed border-[#CBD5E1] hover:border-[#3978C5] rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#F8FAFC] hover:bg-[#EBF3FC]">
            <UploadCloud className="w-6 h-6 text-[#718096] mb-1.5" />
            <span className="text-xs font-semibold text-[#183B66]">
              Click to upload a photo of the problem
            </span>
            <span className="text-[11px] text-[#718096] mt-0.5">PNG, JPG, WebP up to 5MB</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Clear Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-primary text-sm !py-3 disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting Report to Municipal Triage...</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              <span>Submit Complaint</span>
            </>
          )}
        </button>
        <p className="text-[11px] text-[#718096] text-center mt-2.5">
          Your report will be assigned a permanent reference code and tracked transparently.
        </p>
      </div>
    </form>
  );
}
