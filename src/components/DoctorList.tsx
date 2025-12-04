import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Users, Mail, Stethoscope, Building2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  specialization: string | null;
  department_id: string;
  department?: {
    name: string;
    specialty: string | null;
  };
}

interface DoctorListProps {
  onDoctorSelect?: (doctor: Doctor) => void;
  selectedDoctorId?: string;
  filterByDepartment?: string;
  showSearch?: boolean;
  groupByDepartment?: boolean;
}

export function DoctorList({
  onDoctorSelect,
  selectedDoctorId,
  filterByDepartment,
  showSearch = true,
  groupByDepartment = true,
}: DoctorListProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, [filterByDepartment]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from('hospital_staff')
        .select(`
          id,
          first_name,
          last_name,
          email,
          specialization,
          department_id,
          department:departments(name, specialty)
        `)
        .eq('staff_type', 'doctor')
        .eq('is_active', true)
        .order('last_name');

      if (filterByDepartment) {
        query = query.eq('department_id', filterByDepartment);
      }

      const { data, error } = await query;

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

  const filteredDoctors = doctors.filter((doctor) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      doctor.first_name.toLowerCase().includes(query) ||
      doctor.last_name.toLowerCase().includes(query) ||
      doctor.email.toLowerCase().includes(query) ||
      doctor.specialization?.toLowerCase().includes(query) ||
      doctor.department?.name.toLowerCase().includes(query)
    );
  });

  const groupedDoctors = groupByDepartment
    ? filteredDoctors.reduce((acc, doctor) => {
        const deptName = doctor.department?.name || 'Unknown Department';
        if (!acc[deptName]) {
          acc[deptName] = [];
        }
        acc[deptName].push(doctor);
        return acc;
      }, {} as Record<string, Doctor[]>)
    : { 'All Doctors': filteredDoctors };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search doctors by name, specialization, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {filteredDoctors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No doctors found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDoctors).map(([departmentName, deptDoctors]) => (
            <motion.div
              key={departmentName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {groupByDepartment && (
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">{departmentName}</h3>
                  <Badge variant="secondary" className="ml-2">
                    {deptDoctors.length} {deptDoctors.length === 1 ? 'Doctor' : 'Doctors'}
                  </Badge>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deptDoctors.map((doctor) => (
                  <motion.div
                    key={doctor.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedDoctorId === doctor.id
                          ? 'ring-2 ring-primary shadow-lg'
                          : 'hover:ring-1 hover:ring-primary/50'
                      }`}
                      onClick={() => onDoctorSelect?.(doctor)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-start justify-between">
                          <span>
                            Dr. {doctor.first_name} {doctor.last_name}
                          </span>
                          {selectedDoctorId === doctor.id && (
                            <Badge variant="default" className="ml-2">
                              Selected
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {doctor.specialization && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Stethoscope className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{doctor.specialization}</span>
                          </div>
                        )}
                        {!groupByDepartment && doctor.department?.name && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{doctor.department.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate text-xs">{doctor.email}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
