const approved_leaveTemplate=(name,days,employeeId,)=>{
  return(
    `
    <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Leave Approved</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        padding: 20px;
      }
      .container {
        background-color: #ffffff;
        padding: 20px;
        border-radius: 8px;
        max-width: 600px;
        margin: auto;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      h2 {
        color: #4CAF50;
      }
      p {
        font-size: 16px;
        line-height: 1.5;
      }
      .footer {
        margin-top: 20px;
        font-size: 12px;
        color: #888888;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Leave Approved ✅</h2>
      <h2>Employee Id-${employeeId}</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>
        Your leave request from <strong>${days[0]}</strong> to <strong>${days[days.length -1]}</strong> has been
        <strong>approved</strong>.
      </p>
      <p>We hope you have a great time off!</p>
      <div class="footer">
        <p>HR Department</p>
        <p>HR-SYS</p>
      </div>
    </div>
  </body>
</html>
    `

  )
}


module.exports=approved_leaveTemplate