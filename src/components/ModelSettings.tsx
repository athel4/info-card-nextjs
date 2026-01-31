import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, RefreshCw } from 'lucide-react';

interface ModelSetting {
  id: number;
  setting_name: string;
  model_name: string;
  description: string;
  is_active: boolean;
}

export const ModelSettings = () => {
  const [settings, setSettings] = useState<ModelSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_model_settings')
        .select('*')
        .order('setting_name');

      if (error) throw error;
      setSettings(data?.map(item => ({
        ...item,
        description: item.description || '',
        is_active: item.is_active || false
      })) || []);
    } catch (error) {
      console.error('Error fetching model settings:', error);
      toast({
        title: "Error",
        description: "Failed to load model settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (id: number, modelName: string) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('ai_model_settings')
        .update({ model_name: modelName })
        .eq('id', id);

      if (error) throw error;

      setSettings(prev =>
        prev.map(setting =>
          setting.id === id ? { ...setting, model_name: modelName } : setting
        )
      );

      toast({
        title: "Success",
        description: "Model setting updated successfully",
      });
    } catch (error) {
      console.error('Error updating model setting:', error);
      toast({
        title: "Error",
        description: "Failed to update model setting",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const commonModels = [
    'gpt-4.1-2025-04-14',
    'gpt-4.1-mini-2025-04-14',
    'gpt-4o-mini',
    'o3-2025-04-16',
    'o4-mini-2025-04-16'
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>AI Model Settings</CardTitle>
          </div>
          <CardDescription>Configure which OpenAI models to use for different operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <CardTitle>AI Model Settings</CardTitle>
        </div>
        <CardDescription>Configure which OpenAI models to use for different operations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {settings.map((setting) => (
          <div key={setting.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor={`model-${setting.id}`} className="text-sm font-medium">
                  {setting.setting_name.replace('_', ' ').toUpperCase()}
                </Label>
                <p className="text-sm text-muted-foreground">{setting.description}</p>
              </div>
              <Badge variant={setting.is_active ? 'default' : 'secondary'}>
                {setting.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Input
                id={`model-${setting.id}`}
                value={setting.model_name}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setSettings(prev =>
                    prev.map(s =>
                      s.id === setting.id ? { ...s, model_name: newValue } : s
                    )
                  );
                }}
                placeholder="Enter model name"
                className="flex-1"
              />
              <Button
                onClick={() => updateSetting(setting.id, setting.model_name)}
                disabled={saving}
                size="sm"
                className="cursor-pointer hover:shadow-md"
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {commonModels.map((model) => (
                <Badge
                  key={model}
                  variant="outline"
                  className="cursor-pointer hover:bg-secondary hover:shadow-sm"
                  onClick={() => {
                    setSettings(prev =>
                      prev.map(s =>
                        s.id === setting.id ? { ...s, model_name: model } : s
                      )
                    );
                  }}
                >
                  {model}
                </Badge>
              ))}
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <Button
            onClick={fetchSettings}
            variant="outline"
            disabled={loading}
            className="w-full cursor-pointer hover:shadow-md"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};