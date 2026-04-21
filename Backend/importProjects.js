const mongoose = require('mongoose');
const Project = require('./models/project');
require('dotenv').config();

const spreadsheetData = [
  {
    borrowerName: "Abay Industry Development SC",
    approvedLoan: 251677463.00,
    listFixedAsset: "Building, machinery & Electrical",
    assetCode: "N/A",
    sumInsured: 363825954.75,
    insuranceCompany: "Nib Insurance",
    isDBEBeneficiary: "Yes",
    insuredDate: "2025-10-17",
    expiryDate: "2026-10-16",
    officerEmail: "yohannessh@dbe.com.et",
    directorEmail: "john.shewakena@gmail.com",
    remark: ""
  },
  {
    borrowerName: "Abay Industry Development SC",
    approvedLoan: 251677463.00,
    listFixedAsset: "Vehicle",
    assetCode: "03-18276 AM",
    sumInsured: 4500000.00,
    insuranceCompany: "Nile Insurance",
    isDBEBeneficiary: "Yes",
    insuredDate: "2025-04-06",
    expiryDate: "2025-04-05",
    officerEmail: "yohannessh@dbe.com.et",
    directorEmail: "john.shewakena@gmail.com",
    remark: ""
  },
  {
    borrowerName: "Abay Industry Development SC",
    approvedLoan: 251677463.00,
    listFixedAsset: "Vehicle",
    assetCode: "03-18277 AM",
    sumInsured: 4500000.00,
    insuranceCompany: "Nile Insurance",
    isDBEBeneficiary: "Yes",
    insuredDate: "2025-04-06",
    expiryDate: "2025-04-05",
    officerEmail: "yohannessh@dbe.com.et",
    directorEmail: "john.shewakena@gmail.com",
    remark: ""
  },
  {
    borrowerName: "Abay Industry Development SC",
    approvedLoan: 251677463.00,
    listFixedAsset: "Vehicle",
    assetCode: "03-20512AM",
    sumInsured: 4500000.00,
    insuranceCompany: "Nile Insurance",
    isDBEBeneficiary: "Yes",
    insuredDate: "2026-01-03",
    expiryDate: "2027-01-02",
    officerEmail: "yohannessh@dbe.com.et",
    directorEmail: "john.shewakena@gmail.com",
    remark: ""
  },
  {
    borrowerName: "Abay Industry Development SC",
    approvedLoan: 251677463.00,
    listFixedAsset: "Vehicle",
    assetCode: "03-20521AM",
    sumInsured: 4500000.00,
    insuranceCompany: "Nile Insurance",
    isDBEBeneficiary: "Yes",
    insuredDate: "2026-01-12",
    expiryDate: "2027-01-11",
    officerEmail: "yohannessh@dbe.com.et",
    directorEmail: "john.shewakena@gmail.com",
    remark: ""
  },
  {
    borrowerName: "Abay Industry Development SC",
    approvedLoan: 251677463.00,
    listFixedAsset: "Vehicle",
    assetCode: "03-20520AM",
    sumInsured: 4500000.00,
    insuranceCompany: "Nile Insurance",
    isDBEBeneficiary: "Yes",
    insuredDate: "2026-01-12",
    expiryDate: "2027-01-11",
    officerEmail: "yohannessh@dbe.com.et",
    directorEmail: "john.shewakena@gmail.com",
    remark: ""
  },
  {
    borrowerName: "Abay Industry Development SC",
    approvedLoan: 251677463.00,
    listFixedAsset: "Vehicle",
    assetCode: "03-20513AM",
    sumInsured: 4500000.00,
    insuranceCompany: "Nile Insurance",
    isDBEBeneficiary: "Yes",
    insuredDate: "2026-02-16",
    expiryDate: "2027-02-15",
    officerEmail: "yohannessh@dbe.com.et",
    directorEmail: "john.shewakena@gmail.com",
    remark: ""
  },
  {
    borrowerName: "Abay Industry Development SC",
    approvedLoan: 251677463.00,
    listFixedAsset: "Vehicle",
    assetCode: "03-20522AM",
    sumInsured: 4500000.00,
    insuranceCompany: "Nile Insurance",
    isDBEBeneficiary: "Yes",
    insuredDate: "2025-01-12",
    expiryDate: "2026-01-11",
    officerEmail: "yohannessh@dbe.com.et",
    directorEmail: "john.shewakena@gmail.com",
    remark: "vehicle is in repair."
  },
  {
    borrowerName: "Abay Industry Development SC",
    approvedLoan: 251677463.00,
    listFixedAsset: "Vehicle",
    assetCode: "03-35436 AM",
    sumInsured: 16920000.00,
    insuranceCompany: "Nile Insurance",
    isDBEBeneficiary: "Yes",
    insuredDate: "2026-02-26",
    expiryDate: "2027-02-25",
    officerEmail: "yohannessh@dbe.com.et",
    directorEmail: "john.shewakena@gmail.com",
    remark: ""
  },
  {
    borrowerName: "Abay Industry Development SC",
    approvedLoan: 251677464.00,
    listFixedAsset: "Vehicle",
    assetCode: "03-35437AM",
    sumInsured: 16920000.00,
    insuranceCompany: "Nile Insurance",
    isDBEBeneficiary: "Yes",
    insuredDate: "2026-02-26",
    expiryDate: "2027-02-25",
    officerEmail: "yohannessh@dbe.com.et",
    directorEmail: "john.shewakena@gmail.com",
    remark: ""
  }
];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");
    await Project.insertMany(spreadsheetData);
    console.log("✅ Successfully imported 10 records with remarks!");
    process.exit();
  } catch (err) {
    console.error("❌ Error importing data:", err);
    process.exit(1);
  }
};

importData();