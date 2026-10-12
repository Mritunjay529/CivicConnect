import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Badge from '../components/Badge';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyC4SlxRUxibU8fZWdkeFa7nVtjkedNTH8c';

export default function ReportCivicIssue({ user, onAddComplaint }) {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageName, setImageName] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagConfidence, setTagConfidence] = useState(0);

  // AI-Suggested Category Tag effect
  useEffect(() => {
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('pothole') || text.includes('road') || text.includes('street paving') || text.includes('asphalt')) {
      setCategory('Road Repair');
      setTagConfidence(94);
    } else if (text.includes('garbage') || text.includes('trash') || text.includes('waste') || text.includes('dump') || text.includes('litter')) {
      setCategory('Waste Management');
      setTagConfidence(89);
    } else if (text.includes('streetlight') || text.includes('lamp') || text.includes('light') || text.includes('dark')) {
      setCategory('Street Lighting');
      setTagConfidence(92);
    } else if (text.includes('drain') || text.includes('sewage') || text.includes('spill') || text.includes('water leak') || text.includes('pipes')) {
      setCategory('Sanitation & Sewage');
      setTagConfidence(87);
    } else if (text.includes('sign') || text.includes('zebra') || text.includes('crossing') || text.includes('traffic')) {
      setCategory('Traffic Signage');
      setTagConfidence(85);
    } else {
      setCategory('');
      setTagConfidence(0);
    }
  }, [description, title]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus({
        type: 'error',
        message: 'Geolocation is not supported by your browser.'
      });
      return;
    }

    setIsLocating(true);
    setLocationStatus(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });

        let detectedAddress = '';

        // 1. Attempt Google Maps Geocoding API with provided API key
        try {
          const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
          const res = await fetch(googleUrl);
          const data = await res.json();
          if (data.status === 'OK' && data.results && data.results.length > 0) {
            detectedAddress = data.results[0].formatted_address;
          }
        } catch (err) {
          console.warn('Google Maps Geocoding request failed:', err);
        }

        // 2. Resilient fallback to OpenStreetMap reverse geocoding if Google Maps requires project billing
        if (!detectedAddress) {
          try {
            const osmRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const osmData = await osmRes.json();
            if (osmData && osmData.display_name) {
              detectedAddress = osmData.display_name;
            }
          } catch (osmErr) {
            console.warn('OSM reverse geocoding fallback failed:', osmErr);
          }
        }

        // 3. Fallback coordinates format
        if (!detectedAddress) {
          detectedAddress = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }

        setLocation(detectedAddress);
        setLocationStatus({
          type: 'success',
          message: `Location detected at ${lat.toFixed(4)}, ${lng.toFixed(4)}`
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
        setLocationStatus({
          type: 'error',
          message: 'Could not access device GPS. Please grant browser location permission or enter address manually.'
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !description || !location || !category) {
      alert('Please fill out all required fields and ensure a category is suggested or set.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newIssue = {
        id: 'comp-' + Math.floor(Math.random() * 1000),
        title: title,
        description: description,
        imageUrl: imagePreview || 'https://images.unsplash.com/photo-1599740831146-7a69476b5270?auto=format&fit=crop&w=600&q=80',
        category: category,
        location: location,
        coordinates: coords ? { latitude: coords.lat, longitude: coords.lng } : null,
        status: 'Pending',
        priority: category === 'Road Repair' || category === 'Sanitation & Sewage' ? 'High' : 'Medium',
        date: new Date().toISOString().split('T')[0],
        reportedBy: user ? user.name : 'Anonymous Citizen',
        updates: [
          { date: new Date().toISOString().split('T')[0], text: 'Issue reported and queued for verification.' }
        ]
      };

      onAddComplaint(newIssue);
      setIsSubmitting(false);
      navigate('/complaint-tracking');
    }, 1000);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-12 flex flex-col items-center min-h-[calc(100vh-64px)] pb-24">
      <Card className="w-full max-w-[650px] flex flex-col gap-6">
        <div className="border-b border-border-custom pb-4">
          <h2 className="text-2xl font-extrabold text-secondary">Report a Civic Issue</h2>
          <p className="text-sm text-secondary/60 mt-1">Submit visual proof and description of local damage. Our AI will tag the category and prioritize resolution.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Title */}
          <Input
            label="Short Issue Title"
            type="text"
            name="title"
            placeholder="e.g. Hazardous pothole at junction"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* Description */}
          <Input
            label="Detailed Description"
            type="textarea"
            name="description"
            placeholder="Describe the issue, its severity, and how it impacts local residents (try using keywords like 'pothole', 'garbage', 'light' or 'drain' to trigger AI categories)."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
          />

          {/* AI-Suggested Category Display */}
          <div className="bg-surface-low border border-border-custom p-4 rounded-custom-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-secondary/50 uppercase tracking-wider block mb-1">AI Classification Tag</span>
              {category ? (
                <div className="flex items-center gap-2">
                  <Badge variant="primary">{category}</Badge>
                  <span className="text-xs text-green-700 font-semibold">{tagConfidence}% Match confidence</span>
                </div>
              ) : (
                <span className="text-sm text-secondary/40 italic">Waiting for text description keywords...</span>
              )}
            </div>
            {category && (
              <span className="material-symbols-outlined text-green-700 bg-green-50 p-1.5 rounded-full text-[20px]">
                done_all
              </span>
            )}
          </div>

          {/* Photo Upload Area */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-secondary">Attach Photo Evidence</label>
            <div className="border-2 border-dashed border-border-custom rounded-custom-lg p-6 flex flex-col items-center justify-center text-center gap-4 bg-background/50 hover:bg-surface-low/30 transition-all">
              {imagePreview ? (
                <div className="relative w-full max-h-[220px] rounded-custom-lg overflow-hidden border border-border-custom">
                  <img src={imagePreview} alt="Issue evidence" className="w-full h-full object-cover max-h-[220px]" />
                  <button
                    type="button"
                    onClick={() => { setImagePreview(null); setImageName(''); }}
                    className="absolute top-2 right-2 bg-error text-white p-1.5 rounded-full shadow-md hover:bg-error/90"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[48px] text-secondary/40">
                    add_a_photo
                  </span>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-secondary">Drag and drop file here, or browse files</p>
                    <p className="text-xs text-secondary/40">PNG, JPG or WEBP up to 5MB</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      id="file-upload"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <label
                      htmlFor="file-upload"
                      className="bg-white border border-border-custom hover:border-primary text-secondary hover:text-primary px-4 py-2.5 rounded-custom-lg font-semibold text-xs transition-all cursor-pointer h-10 flex items-center shadow-sm"
                    >
                      Browse Device
                    </label>
                  </div>
                </>
              )}
              {imageName && <p className="text-xs text-secondary/50 font-semibold mt-1">Uploaded: {imageName}</p>}
            </div>
          </div>

          {/* Location Area */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-secondary">
                Issue Location (Google Maps GPS Detection)
              </label>
              {coords && (
                <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  GPS Coordinates Locked
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Street address, landmark or detected location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleAutoLocation}
                disabled={isLocating}
                className="h-12 px-4 flex items-center gap-2 border-border-custom hover:border-primary text-secondary hover:text-primary font-semibold text-xs shadow-xs"
                title="Detect Current Location via GPS & Google Maps"
              >
                {isLocating ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-primary text-[18px]">progress_activity</span>
                    <span>Locating...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-primary text-[18px]">my_location</span>
                    <span>Detect Location</span>
                  </>
                )}
              </Button>
            </div>

            {locationStatus && (
              <div
                className={`text-xs p-2.5 rounded-custom-md font-medium flex items-center gap-2 ${
                  locationStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {locationStatus.type === 'success' ? 'location_on' : 'warning'}
                </span>
                <span>{locationStatus.message}</span>
              </div>
            )}

            {/* Google Maps Embed Preview */}
            {coords && (
              <div className="mt-2 overflow-hidden rounded-custom-lg border border-border-custom bg-surface-low">
                <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-border-custom text-xs">
                  <span className="font-bold text-secondary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[16px]">map</span>
                    Google Maps Pin: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                  </span>
                  <a
                    href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    Open in Google Maps
                    <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                  </a>
                </div>
                <iframe
                  title="Google Maps Location Preview"
                  width="100%"
                  height="180"
                  className="border-0 w-full"
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=16&output=embed`}
                />
              </div>
            )}

            <p className="text-[11px] text-secondary/50 italic">
              Click &quot;Detect Location&quot; to auto-fetch your current GPS coordinates and reverse-geocode the address via Google Maps.
            </p>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-border-custom flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !title || !description || !location || !category}
              className="px-8"
            >
              {isSubmitting ? 'Submitting Issue...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
