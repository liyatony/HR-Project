
const rejected_leaveTemplate = ({ name, startDate,endDate ,reason = "Not specified", managerName = "HR Team", companyName = "HR-SYS" }) => {

  console.log(name,startDate,endDate);
  

  function isoToDateString(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN");
  }

const sDate=isoToDateString(startDate);
const eDate =isoToDateString(endDate)
  
  const plainText = `Hi ${name},

Your leave request from ${sDate} to ${eDate} has been rejected.

Reason: ${reason}

If you have any questions, please contact ${managerName}.

Regards,
${managerName}
${companyName}
`;

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Leave Request Rejected</title>
  <style>
    /* Basic, email-safe styles */
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial; background:#f4f7fb; margin:0; padding:20px; color:#333; }
    .container { background:#ffffff; max-width:600px; margin:0 auto; border-radius:8px; box-shadow:0 2px 8px rgba(10,10,10,0.08); overflow:hidden; }
    .header { background:#fff7f7; padding:20px; border-bottom:1px solid #f0dede; }
    .title { color:#c53030; font-size:20px; margin:0; }
    .content { padding:24px; }
    p { margin:0 0 12px 0; line-height:1.45; }
    .meta { background:#fafafa; padding:12px 16px; border:1px solid #efefef; border-radius:6px; margin:12px 0; }
    .footer { padding:16px 24px 28px 24px; font-size:13px; color:#777; }
    .btn { display:inline-block; padding:10px 16px; border-radius:6px; text-decoration:none; color:#fff; background:#e53e3e; margin-top:8px; }
    @media (max-width:420px) { .content { padding:16px } }
  </style>
</head>
<body>
  <div class="container" role="article" aria-label="Leave request rejected">
    <div class="header">
      <h1 class="title">Leave Request — Rejected</h1>
    </div>

    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>

      <p>We are writing to inform you that your leave request for the period below has been <strong style="color:#c53030;">rejected</strong>.</p>

      <div class="meta">
        <p><strong>From:</strong> ${sDate}</p>
        <p><strong>To:</strong> ${eDate}</p>
        <p><strong>Reason provided:</strong> ${reason}</p>
      </div>

      <p>If you believe this decision is in error or you need further clarification, please contact <strong>${managerName}</strong>.</p>

      <p style="margin-top:14px">Regards,<br/><strong>${managerName}</strong><br/>${companyName}</p>

      <!-- optional action (comment out if not needed) -->
      <!-- <a class="btn" href="mailto:hr@example.com?subject=Leave%20Rejection%20Query">Contact HR</a> -->
    </div>

    <div class="footer">
      <p>This is an automated message from ${companyName}. Please do not reply to this email directly.</p>
    </div>
  </div>
</body>
</html>`;

  return { html, text: plainText };
};

module.exports = rejected_leaveTemplate;
