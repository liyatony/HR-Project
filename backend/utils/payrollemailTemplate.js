 const payrollEmailTemplate = (data) => {

  
  return `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2>Salary Processed for ${data.month}</h2>
    <p>Hi <strong>${data.name}</strong>,</p>
    <p>Your salary has been successfully processed. Below is the summary:</p>
    <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
      <tr>
        <td>Working Days:</td><td>${data.workingDays}</td>
      </tr>
      <tr>
        <td>Present Days:</td><td>${data.presentDays}</td>
      </tr>
      <tr>
        <td>Leave Days:</td><td>${data.leaves}</td>
      </tr>
      <tr>
        <td>Absent Days:</td><td>${data.totalAbsentDays}</td>
      </tr>
      <tr>
        <td>Overtime Hours:</td><td>${data.overtime}</td>
      </tr>
      <tr>
        <td>Absent Deductions:</td><td>${data.absentDeductions}</td>
      </tr>
      <tr>
        <td>Base Salary:</td><td>${data.baseSalary}</td>
      </tr>
      <tr>
        <td><strong>Net Salary:</strong></td><td><strong>${data.netSalary}</strong></td>
      </tr>
    </table>
    <p>Your salary has been credited to your bank account. You can download your payslip from the Employee Portal.</p>
    <p>If you find any issues, please contact HR within 48 hours.</p>
    <p>Regards,<br><strong>HR Department</strong></p>
  </div>
  `;
};

module.exports=payrollEmailTemplate