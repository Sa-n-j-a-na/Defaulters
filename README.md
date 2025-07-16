# 🚨 Defaulter Tracking System (MERN Stack)

A web application to track defaulters (latecomers, dress code violations) in an institute, built using the **MERN Stack (MongoDB, Express, React, Node.js)**.

## 🎥 Demo Video
[![Watch Demo](https://drive.google.com/file/d/1SQr3mNZCYtCQNaGGndjR3AoNAe80o3YB/view?usp=sharing)]

## ✨ Features

### 👤 PE (Physical Education) Login
- Can **enter defaulter data** (Roll No., Type - e.g., latecomer, dress code).
- **Only roll number** needs to be entered — other student details auto-filled.
- **Cannot add the same student for the same type on the same day**.
- Defaulter date is automatically set to **current date**.
- Can **generate report** by:
  - **Defaulter Type**
  - **From Date to To Date**

### 👨‍🏫 Mentor Login
- Can view their assigned **mentees who are defaulters**.
- Can **generate reports** similar to PE login.
- Can also view **repeated defaulters** with **cumulative reports** (how many times a student became a defaulter).

### 🎓 HOD Login
- Can see **students from their department** who were marked as defaulters.
- Can generate:
  - **Defaulter reports**
  - **Repeated defaulter reports**
- Access to **Mentor Overview**:
  - Shows mentors and **count of defaulters reported under them in the last 7 days**.
  - Helps identify mentors with high defaulter activity.

## 🛠 Problem Solved
- ❌ Manual data entry and tracking was error-prone.
- ❌ Following up with mentors and HODs was difficult.
- ✅ Now, PE needs to **only enter roll number**, saving time.
- ✅ Prevents **duplicate entries** for the same day and same type.
- ✅ Clear reports for **mentors and HODs** to take timely action.

---

## 🧑‍💻 Tech Stack
- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB