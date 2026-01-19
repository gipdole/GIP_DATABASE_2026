// components/FillAndDownloadContract.jsx
import React from 'react';
import { IconButton } from '@mui/material';
import { PictureAsPdf } from '@mui/icons-material';
import { fillPdf } from '../utils/fillPdf';
import contractTemplate from '../assets/contract-template-gip.pdf';

const FillAndDownloadContract = ({ employee }) => {
  const handleFill = async () => {
    try {
      const response = await fetch(contractTemplate);
      const pdfBytes = await response.arrayBuffer();

      const filledPdfBytes = await fillPdf(pdfBytes, {
        name: employee.name,
        startDate: new Date(employee.startDate).toLocaleDateString('en-PH'),
        endDate: new Date(employee.endDate).toLocaleDateString('en-PH'),
        assignmentPlace: employee.assignmentPlace || '',
        contactPerson: employee.contactPerson || '',
        address: employee.address || '',
        validId: employee.validId || '',
        validIdIssued: employee.validIdIssued || '',
      });

      const blob = new Blob([filledPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${employee.name}_GIP_Contract.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating contract PDF:', error);
    }
  };

  return (
    <IconButton onClick={handleFill} size="small" color="error" title="Generate Contract">
      <PictureAsPdf fontSize="small" />
    </IconButton>
  );
};

export default FillAndDownloadContract;
