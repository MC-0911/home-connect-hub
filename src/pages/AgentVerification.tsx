import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAgentVerification } from '@/hooks/useAgentVerification';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ShieldCheck, Upload, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
  'Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky',
  'Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi',
  'Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico',
  'New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania',
  'Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
];

export default function AgentVerification() {
  const { user } = useAuth();
  const { status, loading: statusLoading } = useAgentVerification();
  const navigate = useNavigate();
  const [licenseNumber, setLicenseNumber] = useState('');
  const [state, setState] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  if (statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (status === 'verified') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <ShieldCheck className="w-16 h-16 text-emerald-500 mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Already Verified!</h2>
            <p className="text-muted-foreground">Your agent license has been verified.</p>
            <Button asChild><Link to="/agent-dashboard">Back to Dashboard</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <Clock className="w-16 h-16 text-amber-500 mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Under Review</h2>
            <p className="text-muted-foreground">Your verification is being reviewed. We'll notify you once it's approved.</p>
            <Button asChild variant="outline"><Link to="/agent-dashboard">Back to Dashboard</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseNumber.trim() || !state || !file) {
      toast.error('Please fill in all fields and upload your license photo.');
      return;
    }

    setSubmitting(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/license.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('agent-documents')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('agent-documents')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from('agent_verifications')
        .upsert({
          user_id: user.id,
          license_number: licenseNumber.trim(),
          state,
          license_photo_url: urlData.publicUrl,
          status: 'pending',
        }, { onConflict: 'user_id' });

      if (insertError) throw insertError;

      toast.success('Verification submitted! We\'ll review it shortly.');
      navigate('/agent-dashboard');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to submit verification.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/agent-dashboard"><ArrowLeft className="w-4 h-4 mr-2" />Back to Dashboard</Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              Agent Verification
            </CardTitle>
            <CardDescription>
              Submit your real estate license for verification to unlock all agent features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="license">License Number</Label>
                <Input
                  id="license"
                  placeholder="e.g. DRE-01234567"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>State of Licensure</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">License Photo</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('photo')?.click()}>
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {file ? file.name : 'Click to upload your license photo'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG or PDF up to 5MB</p>
                </div>
                <input
                  id="photo"
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit for Verification'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
