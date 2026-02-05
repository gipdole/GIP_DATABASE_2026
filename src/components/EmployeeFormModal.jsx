import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, MenuItem, Typography, Box
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
  age: '',
  lgu: '',
  address: '',
  gender: '',
  contactNumber: '',
  email: '',
  educationalAttainment: '',
  
  primaryDegree: '',
  primarySchool: '',
  primaryYear: '',
  secondaryDegree: '',
  secondarySchool: '',
  secondaryYear: '',
  collegeDegree: '',
  collegeSchool: '',
  collegeYear: '',

  workCompany: '',
  workPosition: '',
  workPeriod: '',
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
};

const LGU_OPTIONS = [
  'N/A', 'ATOK', 'BAGUIO CITY', 'BAKUN', 'BENGUET', 'BOKOD', 'BUGUIAS',
  'ITOGON', 'KABAYAN', 'KAPANGAN', 'KIBUNGAN', 'MANKAYAN',
  'LA TRINIDAD', 'SABLAN', 'TUBA', 'TUBLAY'
];

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

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
    <Box sx={{ backgroundColor: '#2196f3', px: 2, py: 1 }}>
      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>{title}</Typography>
    </Box>
    <Box sx={{ p: 2 }}>{children}</Box>
  </Box>
);

const EmployeeFormModal = ({ open, onClose, mode, employee = null, refresh }) => {
  const [form, setForm] = useState(defaultForm);
  const isEditMode = mode === 'edit';

  useEffect(() => {
    if (isEditMode && employee) {
      setForm({ ...defaultForm, ...employee,
        age: employee.birthDate ? String(calculateAge(employee.birthDate)) : '',
        monthsWorked: (employee.startDate && employee.endDate) ? String(calculateMonthsWorked(employee.startDate, employee.endDate)) : ''
      });
    } else {
      setForm(defaultForm);
    }
  }, [employee, mode, open]);

  useEffect(() => {
    if (form.startDate && form.endDate) {
      const months = calculateMonthsWorked(form.startDate, form.endDate);
      setForm((prev) => ({ ...prev, monthsWorked: String(months) }));
    }
  }, [form.startDate, form.endDate]);

  useEffect(() => {
    if (form.birthDate) {
      const age = calculateAge(form.birthDate);
      setForm((prev) => ({ ...prev, age: String(age) }));
    }
  }, [form.birthDate]);

  useEffect(() => {
  const autoGenerateGipId = async () => {
    if (
      form.gipId ||                // user already typed
      !form.name?.trim() ||         // no name yet
      !form.startDate               // no start date yet
    ) {
      return;
    }

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
  }, [form.name, form.startDate]); // 🔑 triggers only when needed


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
              <TextField fullWidth label="Full Name" name="name" value={form.name} onChange={handleChange} required />
              <TextField fullWidth label="GIP ID" name="gipId" value={form.gipId} onChange={handleChange} />
              <TextField fullWidth label="Address" name="address" value={form.address} onChange={handleChange} />
              <TextField fullWidth label="Date of Birth" name="birthDate" type="date" value={form.birthDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
              <TextField fullWidth label="Age" name="age" value={form.age} onChange={handleChange} />
              <TextField fullWidth label="Gender" name="gender" value={form.gender} onChange={handleChange} select>
                {GENDER_OPTIONS.map((gender) => <MenuItem key={gender} value={gender}>{gender}</MenuItem>)}
              </TextField>
              <TextField fullWidth label="Contact Number" name="contactNumber" value={form.contactNumber} onChange={handleChange} />
              <TextField fullWidth label="Email Address" name="email" value={form.email} onChange={handleChange} />
            </Stack>
          </SectionBox>

          <SectionBox title="Educational Background">
            <Stack spacing={2}>
                <TextField fullWidth label="Educational Attainment" name="education" value={form.education} onChange={handleChange} />

                <TextField fullWidth label="Primary Degree / Track" name="primaryDegree" value={form.primaryDegree} onChange={handleChange} />
                <TextField fullWidth label="Primary School" name="primarySchool" value={form.primarySchool} onChange={handleChange} />
                <TextField fullWidth label="Primary Year" name="primaryYear" value={form.primaryYear} onChange={handleChange} />

                <TextField fullWidth label="Secondary Degree / Track" name="secondaryDegree" value={form.secondaryDegree} onChange={handleChange} />
                <TextField fullWidth label="Secondary School" name="secondarySchool" value={form.secondarySchool} onChange={handleChange} />
                <TextField fullWidth label="Secondary Year" name="secondaryYear" value={form.secondaryYear} onChange={handleChange} />

                <TextField fullWidth label="College Degree / Course" name="collegeDegree" value={form.collegeDegree} onChange={handleChange} />
                <TextField fullWidth label="College School" name="collegeSchool" value={form.collegeSchool} onChange={handleChange} />
                <TextField fullWidth label="College Year" name="collegeYear" value={form.collegeYear} onChange={handleChange} />

            </Stack>
          </SectionBox>

          <SectionBox title="Work Experience">
            <Stack spacing={2}>
              <TextField fullWidth label="Company Name" name="workCompany" value={form.workCompany} onChange={handleChange} />
              <TextField fullWidth label="Position" name="workPosition" value={form.workPosition} onChange={handleChange} />
              <TextField fullWidth label="Period of Engagement" name="workPeriod" value={form.workPeriod} onChange={handleChange} />
            </Stack>
          </SectionBox>

          <SectionBox title="Government Info">
            <Stack spacing={2}>
              <TextField fullWidth label="Disadvantage Group" name="disadvantageGroup" value={form.disadvantageGroup} onChange={handleChange} />
              <TextField fullWidth label="Documents Submitted" name="documentsSubmitted" value={form.documentsSubmitted}  onChange={handleChange} />
              <TextField fullWidth label="Valid ID Type and No." name="validId" value={form.validId} onChange={handleChange} />
              <TextField fullWidth label="Date or Place Issued" name="validIdIssued" value={form.validIdIssued} onChange={handleChange} />
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
              <TextField fullWidth label="Date Hired" name="startDate" type="date" value={form.startDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
              <TextField fullWidth label="Date Ended" name="endDate" type="date" value={form.endDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
              <TextField fullWidth label="Place of Assignment" name="assignmentPlace" value={form.assignmentPlace} onChange={handleChange} />
              <TextField fullWidth label="ADL Number" name="adlNo" value={form.adlNo} onChange={handleChange} />
            </Stack>
          </SectionBox>

          <SectionBox title="GSIS & GPAI">
            <Stack spacing={2}>
              <TextField fullWidth label="GSIS Beneficiary Name" name="gsisName" value={form.gsisName} onChange={handleChange} />
              <TextField fullWidth label="GSIS Beneficiary Relationship" name="gsisRelationship" value={form.gsisRelationship} onChange={handleChange} />
              <TextField fullWidth label="GPAI Link" name="gpaiLink" value={form.gpaiLink} onChange={handleChange} />
            </Stack>
          </SectionBox>

          <SectionBox title="Other">
            <Stack spacing={2}>
              <TextField fullWidth label="Employment Status" name="employmentStatus" value={form.employmentStatus} onChange={handleChange} />
              <TextField fullWidth label="Remarks" name="remarks" value={form.remarks} onChange={handleChange} multiline rows={2} />
            </Stack>
          </SectionBox>

        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {isEditMode ? 'Save Changes' : 'Add Employee'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeFormModal;