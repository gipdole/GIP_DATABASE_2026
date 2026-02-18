import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, MenuItem, Typography, Box, Grid, Checkbox,
  FormControlLabel, FormControl, FormGroup
} from '@mui/material';

import { addEmployee, updateEmployee } from '../utils/firebaseHelpers';
import { generateNextGipId } from '../utils/idUtils';
import { calculateMonthsWorked } from '../utils/dateUtils';

const defaultForm = {
  name: '',
  gipId: '',
  startDate: '',
  endDate: '',
  monthsWorked: '',
  birthDate: '',
  placeOfBirth: '',
  age: '',
  civilStatus: '',
  lgu: '',
  address: '',
  gender: '',
  contactNumber: '',
  email: '',
  educationalAttainment: '',
  primaryDegree: '',
  primarySchool: '',
  primaryYearTo: '',
  primaryYearFrom: '',
  secondaryDegree: '',
  secondarySchool: '',
  secondaryYearTo: '',
  secondaryYearFrom: '',
  seniorHighDegree: '',
  seniorHighSchool: '',
  seniorHighYearTo: '',
  seniorHighYearFrom: '',
  collegeDegree: '',
  collegeSchool: '',
  collegeYearTo: '',
  collegeYearFrom: '',

  workCompany1: '',
  workPosition1: '',
  workPeriod1: '',
  workCompany2: '',
  workPosition2: '',
  workPeriod2: '',
  workCompany3: '',
  workPosition3: '',
  workPeriod3: '',
  
  disadvantageGroup: '',
  documentsSubmitted: '',
  validId: '',
  validIdIssued: '',
  assignmentPlace: '',
  adlNo: '',
  lbpAccount: '',
  emergencyName: '',
  emergencyContact: '',
  emergencyAddress: '',
  gsisName: '',
  gsisRelationship: '',
  gpaiLink: '',
  employmentStatus: '',
  remarks: '',
  // Checkboxes
  pwd: false,
  iP: false,
  victimOfArmedConflict: false,
  rebelReturnee: false,
  fourP: false,
  othersDG: '',
  // checkboxes documents
  certificationFromSchool: false,
  birthCertificate: false,
  transcriptOfRecords: false,
  diploma: false,
  form137138: false,
  applicationLetter: false,
  barangayCertificate: false,
  othersD: ''

};

const LGU_OPTIONS = [
  'N/A', 'ATOK', 'BAGUIO CITY', 'BAKUN', 'BENGUET', 'BOKOD', 'BUGUIAS',
  'ITOGON', 'KABAYAN', 'KAPANGAN', 'KIBUNGAN', 'MANKAYAN',
  'LA TRINIDAD', 'SABLAN', 'TUBA', 'TUBLAY'
];

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

const CIVIL_STATUS_OPTIONS = ['Single', 'Married', 'Widowed', 'Separated', 'Divorced'];

const EDUCATIONAL_ATTAINMENT_OPTIONS = [
  'Junior High School Graduate',
  'Senior High School Graduate', 'College Graduate',
  'Technical Vocational Graduate', 'ALS Graduate'
];

const BENEFECIARY_RELATIONSHIP_OPTIONS = [
  'Father', 'Mother', 'Spouse', 'Daughter', 'Son', 'Sibling', 'Grandparent'
];

const EMPLOYMENT_STATUS_OPTIONS = [
  'NA', 'Contract Completed', 'Resigned'
];

const calculateAge = (birthDateStr) => {
  const birth = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const SectionBox = ({ title, children }) => (
  <Box sx={{ border: '1px solid black', borderRadius: 2, overflow: 'hidden', mb: 2 }}>
    <Box sx={{ backgroundColor: '#55C386', px: 2, py: 1 }}>
      <Typography variant="h6" sx={{ color: '#000000', fontWeight: 'bold' }}>{title}</Typography>
    </Box>
    <Box sx={{ p: 2 }}>{children}</Box>
  </Box>
);

const EmployeeFormModal = ({ open, onClose, mode, employee = null, refresh }) => {
  const [form, setForm] = useState(defaultForm);
  const isEditMode = mode === 'edit';

  // Populate form in edit mode
  useEffect(() => {
    if (isEditMode && employee) {
      setForm({
        ...defaultForm,
        ...employee,
        age: employee.birthDate ? String(calculateAge(employee.birthDate)) : '',
        monthsWorked: (employee.startDate && employee.endDate)
          ? String(calculateMonthsWorked(employee.startDate, employee.endDate))
          : ''
      });
    } else {
      setForm(defaultForm);
    }
  }, [employee, mode, open, isEditMode]); // ✅ added isEditMode

  // Update monthsWorked when start or end dates change
  useEffect(() => {
    if (form.startDate && form.endDate) {
      const months = calculateMonthsWorked(form.startDate, form.endDate);
      setForm((prev) => ({ ...prev, monthsWorked: String(months) }));
    }
  }, [form.startDate, form.endDate]);

  // Update age when birthDate changes
  useEffect(() => {
    if (form.birthDate) {
      const age = calculateAge(form.birthDate);
      setForm((prev) => ({ ...prev, age: String(age) }));
    }
  }, [form.birthDate]);

  // Auto-generate GIP ID
useEffect(() => {
  const autoGenerateGipId = async () => {
    // ❌ Never auto-generate in edit mode
    if (isEditMode) return;

    // ❌ If already has value (user typed or already generated)
    if (form.gipId?.trim()) return;

    // ❌ If missing required data
    if (!form.name?.trim() || !form.startDate) return;

    try {
      const generated = await generateNextGipId(
        form.name.trim(),
        form.startDate
      );

      setForm((prev) => ({
        ...prev,
        gipId: generated,
      }));
    } catch (err) {
      console.error("Auto GIP ID generation failed:", err);
    }
  };

  autoGenerateGipId();
}, [form.name, form.startDate, isEditMode]);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name) => (e) => {
    setForm((prev) => ({ ...prev, [name]: e.target.checked }));
  };

  const handleSubmit = async () => {
    const trimmedName = form.name.trim();
    const trimmedGipId = form.gipId.trim();

    if (!trimmedName) {
      alert("Full name is required.");
      return;
    }

    let gipIdToUse = trimmedGipId;
    if (!gipIdToUse) {
      try {
        gipIdToUse = await generateNextGipId(trimmedName, form.startDate);
      } catch (err) {
        console.error("GIP ID generation failed:", err);
        alert("Failed to generate GIP ID. Please check Start Date.");
        return;
      }
    }

    const payload = {
      ...form,
      gipId: gipIdToUse,
      age: form.birthDate ? calculateAge(form.birthDate) : null,
      monthsWorked: calculateMonthsWorked(form.startDate, form.endDate),
      year: new Date(form.startDate).getFullYear().toString(),
    };

    try {
      if (isEditMode) {
        await updateEmployee(employee.id, payload);
      } else {
        await addEmployee(payload);
      }
      refresh();
      onClose();
    } catch (error) {
      console.error("Error saving employee:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEditMode ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <SectionBox title="Personal Information">
            <Stack spacing={2}>
              <TextField
                  fullWidth
                  label="GIP ID"
                  name="gipId"
                  value={form.gipId}
                  onChange={handleChange}
                />
              <Grid container spacing={2}>
                <Grid item xs={12} size={8}>
                  <Stack spacing={2}>
                    <TextField fullWidth label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder='Last Name, First Name Middle Name Suffix' required />
                  </Stack>
                </Grid>
                <Grid item xs={12} size={4}>
                  <Stack spacing={2}>
                    <TextField fullWidth label="Gender" name="gender" value={form.gender} onChange={handleChange} select>
                      {GENDER_OPTIONS.map((gender) => (
                        <MenuItem key={gender} value={gender}>{gender}</MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} size={4}>
                  <Stack spacing={2}>
                    <TextField fullWidth label="Date of Birth" name="birthDate" type="date" value={form.birthDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                  </Stack>
                </Grid>
                <Grid item xs={12} size={4}>
                  <Stack spacing={2}>
                    <TextField fullWidth label="Age" name="age" value={form.age} onChange={handleChange} />
                  </Stack>
                </Grid>
                <Grid item xs={12} size={4}>
                  <Stack spacing={2}>
                    <TextField fullWidth label="Civil Status" name="civilStatus" value={form.civilStatus} onChange={handleChange} select>
                      {CIVIL_STATUS_OPTIONS.map((status) => (
                        <MenuItem key={status} value={status}>{status}</MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                </Grid>
              </Grid>
              <Stack spacing={2}>
              <TextField fullWidth label="Place of Birth" name="placeOfBirth" value={form.placeOfBirth} onChange={handleChange} />
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={12} size={6}>
                  <Stack spacing={2}>

                    <TextField fullWidth label="Contact Number" name="contactNumber" value={form.contactNumber} onChange={handleChange} />
                  </Stack>
                </Grid>
                <Grid item xs={12} size={6}>
                  <Stack spacing={2}>

                    <TextField fullWidth label="Email Address" name="email" value={form.email} onChange={handleChange} />
                  </Stack>
                </Grid>
              </Grid>
              <TextField fullWidth label="Address" name="address" value={form.address} onChange={handleChange} />
            </Stack>
          </SectionBox>

          <SectionBox title="Educational Background">
            <Stack spacing={2}>
              <TextField fullWidth label="Educational Attainment" name="education" value={form.education} onChange={handleChange} select>
                {EDUCATIONAL_ATTAINMENT_OPTIONS.map((education) => (
                  <MenuItem key={education} value={education}>{education}</MenuItem>
                ))}
              </TextField>
              <Grid container spacing={2}>
                <Grid item xs={12} size={3}>
                  <Stack spacing={2}>
                    <TextField fullWidth label="Primary Degree / Track" name="primaryDegree" value={form.primaryDegree} onChange={handleChange} />
                    <TextField fullWidth label="Junior High School Degree / Track" name="secondaryDegree" value={form.secondaryDegree} onChange={handleChange} />
                    <TextField fullWidth label="Senior High School Degree / Track" name="seniorHighDegree" value={form.seniorHighDegree} onChange={handleChange} />
                    <TextField fullWidth label="College Degree / Course" name="collegeDegree" value={form.collegeDegree} onChange={handleChange} />
                  </Stack>
                </Grid>
                
                <Grid item xs={12} size={3}>
                  <Stack spacing={2}>
                    <TextField fullWidth label="Year From" name="primaryYearFrom" value={form.primaryYearFrom} onChange={handleChange} />
                    <TextField fullWidth label="Year From" name="secondaryYearFrom" value={form.secondaryYearFrom} onChange={handleChange} />
                    <TextField fullWidth label="Year From" name="seniorHighYearFrom" value={form.seniorHighYearFrom} onChange={handleChange} />
                    <TextField fullWidth label="Year From" name="collegeYearFrom" value={form.collegeYearFrom} onChange={handleChange} />
                  </Stack>
                </Grid>
                <Grid item xs={12} size={3}>
                  <Stack spacing={2}>
                    <TextField fullWidth label="Year To" name="primaryYearTo" value={form.primaryYearTo} onChange={handleChange} />
                    <TextField fullWidth label="Year To" name="secondaryYearTo" value={form.secondaryYearTo} onChange={handleChange} />
                    <TextField fullWidth label="Year To" name="seniorHighYearTo" value={form.seniorHighYearTo} onChange={handleChange} />
                    <TextField fullWidth label="Year To" name="collegeYearTo" value={form.collegeYearTo} onChange={handleChange} />
                  </Stack>
                </Grid>
                <Grid item xs={12} size={3}>
                  <Stack spacing={2}>
                    <TextField fullWidth label="Primary School" name="primarySchool" value={form.primarySchool} onChange={handleChange} />
                    <TextField fullWidth label="Junior High School" name="secondarySchool" value={form.secondarySchool} onChange={handleChange} />
                    <TextField fullWidth label="Senior High School" name="seniorHighSchool" value={form.seniorHighSchool} onChange={handleChange} />
                    <TextField fullWidth label="College School" name="collegeSchool" value={form.collegeSchool} onChange={handleChange} />
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </SectionBox>

          <SectionBox title="Work Experience">
            <Grid container spacing={2}>
              <Grid item xs={12} size={4}>
                <Stack spacing={2}>
                  <TextField fullWidth label="Company Name" name="workCompany1" value={form.workCompany1} onChange={handleChange} />
                  <TextField fullWidth label="Company Name" name="workCompany2" value={form.workCompany2} onChange={handleChange} />
                  <TextField fullWidth label="Company Name" name="workCompany3" value={form.workCompany3} onChange={handleChange} />
                </Stack>
              </Grid>
              <Grid item xs={12} size={4}>
                <Stack spacing={2}>
                  <TextField fullWidth label="Position" name="workPosition1" value={form.workPosition1} onChange={handleChange} />
                  <TextField fullWidth label="Position" name="workPosition2" value={form.workPosition2} onChange={handleChange} />
                  <TextField fullWidth label="Position" name="workPosition3" value={form.workPosition3} onChange={handleChange} />
                </Stack>
              </Grid>
              <Grid item xs={12} size={4}>
                <Stack spacing={2}>
                  <TextField fullWidth label="Period of Engagement" name="workPeriod1" value={form.workPeriod1} onChange={handleChange} />
                  <TextField fullWidth label="Period of Engagement" name="workPeriod2" value={form.workPeriod2} onChange={handleChange} />
                  <TextField fullWidth label="Period of Engagement" name="workPeriod3" value={form.workPeriod3} onChange={handleChange} />
                </Stack>
              </Grid>
            </Grid>
          </SectionBox>

          <SectionBox title="Disadvantage Group">
            <Grid container spacing={2}>
              <Grid item xs={12} size={6}>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={<Checkbox checked={form.pwd} onChange={handleCheckboxChange('pwd')} />}
                    label="Person with Disability (PWD)"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={form.iP} onChange={handleCheckboxChange('iP')} />}
                    label="Indigenous People (IP)"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={form.victimOfArmedConflict} onChange={handleCheckboxChange('victimOfArmedConflict')} />}
                    label="Victim of Armed Conflict"
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} size={6}>
                <Stack spacing={2}>
                  <FormControl>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={form.rebelReturnee}
                            onChange={handleCheckboxChange('rebelReturnee')}
                          />
                        }
                        label="Rebel Returnee"
                      />
                      <FormControlLabel control={<Checkbox checked={form.fourP} onChange={handleCheckboxChange('fourP')} />} label="4Ps Beneficiary" />
                      <TextField fullWidth label="Others, specify:" name="othersDG" value={form.othersDG} onChange={handleChange} variant='filled' sx={{ mt: 2 }} />
                    </FormGroup>
                  </FormControl>
                </Stack>
              </Grid>
            </Grid>
          </SectionBox>

          <SectionBox title="Documents">
            <Grid container spacing={2}>
              <Grid item xs={12} size={6}>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={<Checkbox checked={form.birthCertificate} onChange={handleCheckboxChange('birthCertificate')} />}
                    label="Birth Certificate"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={form.transcriptOfRecords} onChange={handleCheckboxChange('transcriptOfRecords')} />}
                    label="Transcript of Records"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={form.diploma} onChange={handleCheckboxChange('diploma')} />}
                    label="Diploma"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={form.form137138} onChange={handleCheckboxChange('form137138')} />}
                    label="Form 137/138"
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} size={6}>
                <Stack spacing={2}>
                  <FormControl>
                    <FormGroup>
                      <FormControlLabel control={<Checkbox checked={form.applicationLetter} onChange={handleCheckboxChange('applicationLetter')} />} label="Application Letter" />
                      <FormControlLabel control={<Checkbox checked={form.barangayCertificate} onChange={handleCheckboxChange('barangayCertificate')} />} label="Barangay Certificate" />
                      <FormControlLabel control={<Checkbox checked={form.certificationFromSchool} onChange={handleCheckboxChange('certificationFromSchool')} />} label="Certification from School" />
                      <TextField fullWidth label="Others, specify:" name="othersD" value={form.othersD} onChange={handleChange} variant='filled' sx={{ mt: 2 }} />
                    </FormGroup>
                  </FormControl>
                </Stack>
              </Grid>
            </Grid>
          </SectionBox>

          <SectionBox title="Government Info">
            <Stack spacing={2}>
              <TextField fullWidth label="Valid ID Type: Number" name="validId" value={form.validId} onChange={handleChange} />
              <TextField fullWidth label="Date / Place Issued" name="validIdIssued" value={form.validIdIssued} onChange={handleChange} placeholder='MMM/DDD/YYYY or Date Issued' />
              <TextField fullWidth label="LBP Account Number" name="lbpAccount" value={form.lbpAccount} onChange={handleChange} />
            </Stack>
          </SectionBox>

          <SectionBox title="Emergency Contact">
            <Stack spacing={2}>
              <TextField fullWidth label="Emergency Contact Name" name="emergencyName" value={form.emergencyName} onChange={handleChange} />
              <TextField fullWidth label="Emergency Contact Number" name="emergencyContact" value={form.emergencyContact} onChange={handleChange} />
              <TextField fullWidth label="Emergency Contact Address" name="emergencyAddress" value={form.emergencyAddress} onChange={handleChange} />
            </Stack>
          </SectionBox>

          <SectionBox title="GIP Assignment">
            <Stack spacing={2}>
              <TextField fullWidth label="LGU" name="lgu" value={form.lgu} onChange={handleChange} select>
                {LGU_OPTIONS.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
              </TextField>
              <TextField fullWidth label="Previous Experience (days)" name="previousExperience" value={form.previousExperience} onChange={handleChange} />
              <Grid container spacing={2}>
                <Grid item xs={12} size={6}>
                  <Stack spacing={2}>
                    <TextField fullWidth label="Date Hired" name="startDate" type="date" value={form.startDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                    </Stack>
                </Grid>
                <Grid item xs={12} size={6}>
                  <Stack spacing={2}>
                     <TextField fullWidth label="Date Ended" name="endDate" type="date" value={form.endDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                    </Stack>
                </Grid>
                </Grid>
              
             
              <TextField fullWidth label="Place of Assignment" name="assignmentPlace" value={form.assignmentPlace} onChange={handleChange} />
              <TextField fullWidth label="ADL Number" name="adlNo" value={form.adlNo} onChange={handleChange} />
            </Stack>
          </SectionBox>

          <SectionBox title="GSIS">
            <Grid container spacing={2}>
              <Grid item xs={12} size={8}>
                <Stack spacing={2}>
                  <TextField fullWidth label="GSIS Beneficiary Name" name="gsisName" value={form.gsisName} onChange={handleChange} />
                  </Stack>
              </Grid>
              <Grid item xs={12} size={4}>
                <Stack spacing={2}>
                  <TextField fullWidth label="GSIS Beneficiary Relationship" name="gsisRelationship" value={form.gsisRelationship} onChange={handleChange} select>
                      {BENEFECIARY_RELATIONSHIP_OPTIONS.map((relationship) => (
                        <MenuItem key={relationship} value={relationship}>{relationship}</MenuItem>
                      ))}
                    </TextField>
                  </Stack>
              </Grid>
            </Grid>
          </SectionBox>

          <SectionBox title="Other">
            <Stack spacing={2}>
              <TextField fullWidth label="Employment Status" name="employmentStatus" value={form.employmentStatus} onChange={handleChange} select>
                      {EMPLOYMENT_STATUS_OPTIONS.map((status) => (
                        <MenuItem key={status} value={status}>{status}</MenuItem>
                      ))}
                    </TextField>
              <TextField fullWidth label="Remarks" name="remarks" value={form.remarks} onChange={handleChange} multiline rows={2} />
            </Stack>
          </SectionBox>

        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: "#55C386" }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" sx={{ backgroundColor: "#55C386", color: "#000000" }}>
          {isEditMode ? 'Save Changes' : 'Add Employee'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeFormModal;
