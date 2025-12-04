import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Stethoscope, Building2, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  specialization: string | null;
  department_id: string;
  department?: {
    name: string;
  };
}

interface DoctorSelectorProps {
  departmentId?: string;
  selectedDoctorId?: string;
  onSelect: (doctor: Doctor) => void;
}

export function DoctorSelector({
  departmentId,
  selectedDoctorId,
  onSelect,
}: DoctorSelectorProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (departmentId) {
      fetchDoctors();
    } else {
      setDoctors([]);
    }
  }, [departmentId]);

  const fetchDoctors = async () => {
    if (!departmentId) return;

    try {
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('hospital_staff')
        .select(`
          id,
          first_name,
          last_name,
          email,
          specialization,
          department_id,
          department:departments(name)
        `)
        .eq('department_id', departmentId)
        .eq('staff_type', 'doctor')
        .eq('is_active', true)
        .order('last_name');

      if (error) {
        console.error('Error fetching doctors:', error);
        setDoctors([]);
      } else {
        setDoctors(data || []);
      }
    } catch (error) {
      console.error('Exception fetching doctors:', error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!departmentId) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Please select a department first</p>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        <Stethoscope className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No doctors available in this department</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-3">
        {doctors.map((doctor) => (
          <Card
            key={doctor.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedDoctorId === doctor.id
                ? 'ring-2 ring-primary shadow-md'
                : 'hover:ring-1 hover:ring-primary/50'
            }`}
            onClick={() => onSelect(doctor)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">
                      Dr. {doctor.first_name} {doctor.last_name}
                    </h4>
                    {selectedDoctorId === doctor.id && (
                      <Badge variant="default" className="text-xs">
                        Selected
                      </Badge>
                    )}
                  </div>
                  {doctor.specialization && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Stethoscope className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{doctor.specialization}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{doctor.email}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
