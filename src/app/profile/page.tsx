'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Lock, CreditCard, Save, Linkedin, FileText } from 'lucide-react';
import { useAuth } from '@/presentation/contexts/AuthContext';
import { useCredit } from '@/presentation/contexts/CreditContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function ProfilePage() {
  const { user } = useAuth();
  const { creditInfo } = useCredit();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [allowSelfProfiling, setAllowSelfProfiling] = useState(false);
  const [allowLinkedin, setAllowLinkedin] = useState(false);
  
  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    email: user?.email || ''
  });
  
  const [extendedProfile, setExtendedProfile] = useState({
    linkedinUrl: '',
    selfDescription: ''
  });
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;
      
      try {
        // Check package permissions
        if (creditInfo?.packageId) {
          const { data: packageData } = await supabase
            .from('packages')
            .select('allow_self_profiling, allow_linkedin')
            .eq('id', creditInfo.packageId)
            .single();
          
          setAllowSelfProfiling((packageData as any)?.allow_self_profiling || false);
          setAllowLinkedin((packageData as any)?.allow_linkedin || false);
        }
        
        // Fetch extended profile
        const { data: profileData } = await (supabase as any)
          .from('profile_details')
          .select('linkedin_url, self_description')
          .eq('user_id', user.id)
          .single();
        
        if (profileData) {
          setExtendedProfile({
            linkedinUrl: (profileData as any).linkedin_url || '',
            selfDescription: (profileData as any).self_description || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
    
    fetchProfileData();
  }, [user?.id, creditInfo?.packageId]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        email: profile.email,
        data: { full_name: profile.fullName }
      });
      
      if (error) throw error;
      
      // Refresh auth state
      window.location.reload();
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    
    if (passwords.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    setIsPasswordLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });
      
      if (error) throw error;
      
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Password Update Failed",
        description: error instanceof Error ? error.message : "Failed to update password.",
        variant: "destructive",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleExtendedProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    setIsProfileLoading(true);
    
    try {
      const { error } = await (supabase as any)
        .from('profile_details')
        .upsert({
          user_id: user.id,
          linkedin_url: extendedProfile.linkedinUrl,
          self_description: extendedProfile.selfDescription,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      toast({
        title: "Profile Updated",
        description: "Your extended profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handlePaymentPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast({
        title: "Portal Access Failed",
        description: "Unable to access payment portal. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profile.fullName}
                    onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button type="submit" disabled={isPasswordLoading}>
                  <Lock className="h-4 w-4 mr-2" />
                  {isPasswordLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* LinkedIn Profile */}
          {allowLinkedin && (
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Linkedin className="h-5 w-5" />
                LinkedIn Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleExtendedProfileUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                  <Input
                    id="linkedinUrl"
                    value={extendedProfile.linkedinUrl}
                    onChange={(e) => setExtendedProfile(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <Button type="submit" disabled={isProfileLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isProfileLoading ? 'Updating...' : 'Update LinkedIn'}
                </Button>
              </form>
            </CardContent>
          </Card>
          )}

          {/* Self Description - Premium Feature */}
          {allowSelfProfiling && (
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  About Me
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleExtendedProfileUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="selfDescription">Describe Yourself</Label>
                    <Textarea
                      id="selfDescription"
                      value={extendedProfile.selfDescription}
                      onChange={(e) => setExtendedProfile(prev => ({ ...prev, selfDescription: e.target.value }))}
                      placeholder="Tell us about yourself, your role, interests, and what makes you unique..."
                      rows={4}
                    />
                  </div>
                  <Button type="submit" disabled={isProfileLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isProfileLoading ? 'Updating...' : 'Update Description'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Payment Portal */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing & Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Manage your billing information, view payment history, and update payment methods.
              </p>
              <Button onClick={handlePaymentPortal} variant="outline">
                <CreditCard className="h-4 w-4 mr-2" />
                Open Payment Portal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
