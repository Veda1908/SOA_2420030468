
import { useEffect, useState } from "react";
import axios from "axios";
import {
  ShieldCheck,
  House,
  FilePlus2,
  Search,
  LayoutDashboard,
  ClipboardList,
  ChartNoAxesColumn,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Download,
  MapPin,
  Building2,
  Activity,
  Sparkles, MessageCircle, Send, X, ImagePlus
} from "lucide-react";

import "./App.css";

const API = "/api/complaints";

const initialForm = {
  citizenName: "",
  citizenEmail: "",
  location: "",
  description: ""
};

const adminPages = ["dashboard", "manage", "analytics"];
const citizenHistoryKey = "urbanguardian_citizen_complaint_codes";
function readCitizenHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(citizenHistoryKey) || "[]");
    return Array.isArray(saved) ? saved.map(item => typeof item === "string" ? {code:item} : item).filter(item => item && typeof item.code === "string") : [];
  } catch { return []; }
}

// Starter location directory. All choices remain optional; free-text is supported.
const LOCATION_DIRECTORY = {
  "Telangana": {
    "Hyderabad": [
      "Gachibowli",
      "Madhapur",
      "Kondapur",
      "HITEC City",
      "Kukatpally",
      "Miyapur",
      "Banjara Hills",
      "Jubilee Hills",
      "Secunderabad",
      "Ameerpet",
      "LB Nagar",
      "Uppal",
      "Dilsukhnagar",
      "Mehdipatnam",
      "Tolichowki",
      "Manikonda",
      "Narsingi",
      "Kokapet",
      "Nizampet",
      "Bachupally",
      "Chandanagar",
      "Lingampally",
      "Begumpet",
      "Somajiguda",
      "Kompally",
      "Alwal",
      "Malkajgiri",
      "ECIL",
      "Nagole",
      "Attapur",
      "Shamshabad",
      "Rajendranagar",
      "Charminar",
      "Malakpet",
      "Sainikpuri",
      "Tarnaka",
      "Other area"
    ],
    "Warangal": [
      "Hanamkonda",
      "Kazipet",
      "Nakkalagutta",
      "Subedari",
      "Warangal Fort",
      "Matwada",
      "Other area"
    ],
    "Karimnagar": [
      "Mankammathota",
      "Mukarrampura",
      "Kothirampur",
      "Housing Board Colony",
      "Other area"
    ],
    "Nizamabad": [
      "Nizamabad Central",
      "Vinayak Nagar",
      "Armoor Road",
      "Other area"
    ],
    "Khammam": [
      "Khammam Central",
      "Wyra Road",
      "Pakabanda",
      "Other area"
    ],
    "Siddipet": [
      "Siddipet Central",
      "Prashanth Nagar",
      "Other area"
    ]
  },
  "Andhra Pradesh": {
    "Visakhapatnam": [
      "MVP Colony",
      "Gajuwaka",
      "Madhurawada",
      "Dwaraka Nagar",
      "Seethammadhara",
      "Rushikonda",
      "Pendurthi",
      "Akkayyapalem",
      "NAD Junction",
      "Other area"
    ],
    "Vijayawada": [
      "Benz Circle",
      "Governorpet",
      "Patamata",
      "Moghalrajpuram",
      "Labbipet",
      "Bhavanipuram",
      "Kanuru",
      "Other area"
    ],
    "Guntur": [
      "Brodipet",
      "Arundelpet",
      "Lakshmipuram",
      "Pattabhipuram",
      "Nallapadu",
      "Other area"
    ],
    "Tirupati": [
      "Tiruchanur",
      "Renigunta Road",
      "Korlagunta",
      "Alipiri",
      "Other area"
    ],
    "Nellore": [
      "Magunta Layout",
      "Stonehousepet",
      "Vedayapalem",
      "Other area"
    ],
    "Kurnool": [
      "Budhawarpet",
      "Nandyal Road",
      "Kallur",
      "Other area"
    ],
    "Rajahmundry": [
      "Danavaipeta",
      "Morampudi",
      "Bommuru",
      "Other area"
    ]
  },
  "Karnataka": {
    "Bengaluru": [
      "Whitefield",
      "Electronic City",
      "Marathahalli",
      "Indiranagar",
      "Koramangala",
      "HSR Layout",
      "Jayanagar",
      "JP Nagar",
      "Yelahanka",
      "Hebbal",
      "Bellandur",
      "Sarjapur Road",
      "Malleshwaram",
      "Rajajinagar",
      "Banashankari",
      "BTM Layout",
      "KR Puram",
      "Mahadevapura",
      "Other area"
    ],
    "Mysuru": [
      "Vijayanagar",
      "Kuvempunagar",
      "Saraswathipuram",
      "Gokulam",
      "Other area"
    ],
    "Mangaluru": [
      "Kadri",
      "Bejai",
      "Hampankatta",
      "Kankanady",
      "Other area"
    ],
    "Hubballi": [
      "Vidyanagar",
      "Gokul Road",
      "Keshwapur",
      "Other area"
    ]
  },
  "Maharashtra": {
    "Mumbai": [
      "Andheri",
      "Bandra",
      "Powai",
      "Borivali",
      "Dadar",
      "Kurla",
      "Goregaon",
      "Malad",
      "Chembur",
      "Ghatkopar",
      "Colaba",
      "Worli",
      "Lower Parel",
      "Mulund",
      "Kandivali",
      "Other area"
    ],
    "Pune": [
      "Hinjewadi",
      "Kothrud",
      "Baner",
      "Wakad",
      "Hadapsar",
      "Viman Nagar",
      "Kharadi",
      "Shivajinagar",
      "Aundh",
      "Pimple Saudagar",
      "Other area"
    ],
    "Nagpur": [
      "Dharampeth",
      "Sitabuldi",
      "Manish Nagar",
      "Sadar",
      "Other area"
    ],
    "Nashik": [
      "College Road",
      "Panchavati",
      "Gangapur Road",
      "Other area"
    ],
    "Thane": [
      "Ghodbunder Road",
      "Majiwada",
      "Naupada",
      "Other area"
    ]
  },
  "Tamil Nadu": {
    "Chennai": [
      "T Nagar",
      "Adyar",
      "Velachery",
      "Anna Nagar",
      "Tambaram",
      "Guindy",
      "Porur",
      "OMR",
      "Perambur",
      "Nungambakkam",
      "Mylapore",
      "Sholinganallur",
      "Other area"
    ],
    "Coimbatore": [
      "RS Puram",
      "Peelamedu",
      "Gandhipuram",
      "Saibaba Colony",
      "Other area"
    ],
    "Madurai": [
      "Anna Nagar",
      "KK Nagar",
      "Tallakulam",
      "Other area"
    ],
    "Tiruchirappalli": [
      "Srirangam",
      "Thillai Nagar",
      "Cantonment",
      "Other area"
    ],
    "Salem": [
      "Fairlands",
      "Ammapet",
      "Hasthampatti",
      "Other area"
    ]
  },
  "Delhi": {
    "New Delhi": [
      "Connaught Place",
      "Dwarka",
      "Rohini",
      "Karol Bagh",
      "Saket",
      "Lajpat Nagar",
      "Janakpuri",
      "Vasant Kunj",
      "Hauz Khas",
      "Pitampura",
      "Mayur Vihar",
      "Greater Kailash",
      "Okhla",
      "Other area"
    ]
  },
  "Kerala": {
    "Kochi": [
      "Edappally",
      "Kakkanad",
      "Vyttila",
      "Fort Kochi",
      "Palarivattom",
      "Kaloor",
      "Other area"
    ],
    "Thiruvananthapuram": [
      "Kazhakkoottam",
      "Pattom",
      "Vazhuthacaud",
      "Technopark",
      "Other area"
    ],
    "Kozhikode": [
      "Mavoor Road",
      "Nadakkavu",
      "Kallai",
      "Other area"
    ],
    "Thrissur": [
      "Punkunnam",
      "Ayyanthole",
      "East Fort",
      "Other area"
    ]
  },
  "Gujarat": {
    "Ahmedabad": [
      "Satellite",
      "Bopal",
      "Navrangpura",
      "Maninagar",
      "Vastrapur",
      "SG Highway",
      "Other area"
    ],
    "Surat": [
      "Adajan",
      "Vesu",
      "Varachha",
      "Piplod",
      "Other area"
    ],
    "Vadodara": [
      "Alkapuri",
      "Gotri",
      "Manjalpur",
      "Other area"
    ],
    "Rajkot": [
      "Kalawad Road",
      "Raiya Road",
      "University Road",
      "Other area"
    ]
  },
  "Rajasthan": {
    "Jaipur": [
      "Malviya Nagar",
      "Vaishali Nagar",
      "Mansarovar",
      "Jagatpura",
      "C Scheme",
      "Other area"
    ],
    "Jodhpur": [
      "Sardarpura",
      "Ratanada",
      "Paota",
      "Other area"
    ],
    "Udaipur": [
      "Hiran Magri",
      "Fatehpura",
      "Bhuwana",
      "Other area"
    ],
    "Kota": [
      "Talwandi",
      "Vigyan Nagar",
      "Dadabari",
      "Other area"
    ]
  },
  "Uttar Pradesh": {
    "Lucknow": [
      "Gomti Nagar",
      "Hazratganj",
      "Aliganj",
      "Indira Nagar",
      "Alambagh",
      "Other area"
    ],
    "Noida": [
      "Sector 18",
      "Sector 62",
      "Sector 76",
      "Sector 137",
      "Other area"
    ],
    "Ghaziabad": [
      "Indirapuram",
      "Vaishali",
      "Raj Nagar Extension",
      "Other area"
    ],
    "Kanpur": [
      "Swaroop Nagar",
      "Kakadeo",
      "Kidwai Nagar",
      "Other area"
    ],
    "Varanasi": [
      "Sigra",
      "Lanka",
      "Bhelupur",
      "Other area"
    ],
    "Agra": [
      "Sikandra",
      "Dayalbagh",
      "Tajganj",
      "Other area"
    ]
  },
  "West Bengal": {
    "Kolkata": [
      "Salt Lake",
      "New Town",
      "Park Street",
      "Garia",
      "Behala",
      "Dum Dum",
      "Ballygunge",
      "Jadavpur",
      "Other area"
    ],
    "Howrah": [
      "Shibpur",
      "Santragachi",
      "Bally",
      "Other area"
    ],
    "Siliguri": [
      "Sevoke Road",
      "Pradhan Nagar",
      "Hakim Para",
      "Other area"
    ]
  },
  "Madhya Pradesh": {
    "Bhopal": [
      "MP Nagar",
      "Arera Colony",
      "Kolar Road",
      "TT Nagar",
      "Other area"
    ],
    "Indore": [
      "Vijay Nagar",
      "Palasia",
      "Rau",
      "Bhawarkuan",
      "Other area"
    ],
    "Jabalpur": [
      "Napier Town",
      "Wright Town",
      "Vijay Nagar",
      "Other area"
    ],
    "Gwalior": [
      "City Centre",
      "Thatipur",
      "Morar",
      "Other area"
    ]
  },
  "Bihar": {
    "Patna": [
      "Boring Road",
      "Kankarbagh",
      "Rajendra Nagar",
      "Bailey Road",
      "Other area"
    ],
    "Gaya": [
      "Civil Lines",
      "Delha",
      "AP Colony",
      "Other area"
    ],
    "Muzaffarpur": [
      "Mithanpura",
      "Brahmpura",
      "Kalambagh",
      "Other area"
    ]
  },
  "Odisha": {
    "Bhubaneswar": [
      "Patia",
      "Chandrasekharpur",
      "Saheed Nagar",
      "Khandagiri",
      "Other area"
    ],
    "Cuttack": [
      "Badambadi",
      "College Square",
      "Mangalabag",
      "Other area"
    ],
    "Rourkela": [
      "Civil Township",
      "Chhend Colony",
      "Sector 19",
      "Other area"
    ]
  },
  "Punjab": {
    "Chandigarh": [
      "Sector 17",
      "Sector 22",
      "Sector 35",
      "Manimajra",
      "Other area"
    ],
    "Ludhiana": [
      "Sarabha Nagar",
      "Model Town",
      "Dugri",
      "Other area"
    ],
    "Amritsar": [
      "Ranjit Avenue",
      "Lawrence Road",
      "Putlighar",
      "Other area"
    ],
    "Jalandhar": [
      "Model Town",
      "Urban Estate",
      "Maqsudan",
      "Other area"
    ]
  },
  "Haryana": {
    "Gurugram": [
      "DLF Phase 1",
      "Cyber City",
      "Sector 56",
      "Sohna Road",
      "Golf Course Road",
      "Other area"
    ],
    "Faridabad": [
      "Sector 15",
      "NIT",
      "Sector 21",
      "Ballabhgarh",
      "Other area"
    ],
    "Panipat": [
      "Model Town",
      "Sector 11",
      "GT Road",
      "Other area"
    ]
  },
  "Jharkhand": {
    "Ranchi": [
      "Lalpur",
      "Harmu",
      "Doranda",
      "Morabadi",
      "Other area"
    ],
    "Jamshedpur": [
      "Bistupur",
      "Sakchi",
      "Kadma",
      "Other area"
    ],
    "Dhanbad": [
      "Hirapur",
      "Bank More",
      "Saraidhela",
      "Other area"
    ]
  },
  "Assam": {
    "Guwahati": [
      "Dispur",
      "Six Mile",
      "Beltola",
      "Paltan Bazar",
      "Zoo Road",
      "Other area"
    ],
    "Dibrugarh": [
      "Chowkidingee",
      "Mancotta",
      "Boiragimoth",
      "Other area"
    ],
    "Silchar": [
      "Tarapur",
      "Rangirkhari",
      "Meherpur",
      "Other area"
    ]
  },
  "Chhattisgarh": {
    "Raipur": [
      "Shankar Nagar",
      "Telibandha",
      "Pandri",
      "Tatibandh",
      "Other area"
    ],
    "Bhilai": [
      "Supela",
      "Nehru Nagar",
      "Smriti Nagar",
      "Other area"
    ],
    "Bilaspur": [
      "Vyapar Vihar",
      "Sarkanda",
      "Mangla",
      "Other area"
    ]
  },
  "Uttarakhand": {
    "Dehradun": [
      "Rajpur Road",
      "Prem Nagar",
      "Ballupur",
      "Sahastradhara Road",
      "Other area"
    ],
    "Haridwar": [
      "Jwalapur",
      "Kankhal",
      "SIDCUL",
      "Other area"
    ],
    "Haldwani": [
      "Nainital Road",
      "Mukhani",
      "Kathgodam",
      "Other area"
    ]
  },
  "Goa": {
    "Panaji": [
      "Miramar",
      "Caranzalem",
      "Altinho",
      "Other area"
    ],
    "Margao": [
      "Fatorda",
      "Navelim",
      "Aquem",
      "Other area"
    ],
    "Mapusa": [
      "Duler",
      "Khorlim",
      "Karaswada",
      "Other area"
    ]
  },
  "Himachal Pradesh": {
    "Shimla": [
      "Mall Road",
      "Sanjauli",
      "New Shimla",
      "Other area"
    ],
    "Solan": [
      "Mall Road",
      "Saproon",
      "Chambaghat",
      "Other area"
    ],
    "Dharamshala": [
      "McLeod Ganj",
      "Kotwali Bazar",
      "Sidhbari",
      "Other area"
    ]
  },
  "Jammu and Kashmir": {
    "Srinagar": [
      "Rajbagh",
      "Lal Chowk",
      "Bemina",
      "Other area"
    ],
    "Jammu": [
      "Gandhi Nagar",
      "Trikuta Nagar",
      "Talab Tillo",
      "Other area"
    ]
  },
  "Puducherry": {
    "Puducherry": [
      "White Town",
      "Lawspet",
      "Mudaliarpet",
      "Ariyankuppam",
      "Other area"
    ]
  }
};

function parseArea(location) {
  const value = String(location || "").trim();
  if (!value) return "Unspecified area";
  const parts = value.split(",").map(x => x.trim()).filter(Boolean);
  return parts.length >= 3 ? parts[0] : value;
}


function readable(value) {
  return String(value || "—").replaceAll("_", " ");
}

function statusClass(value) {
  return String(value || "SUBMITTED")
    .toLowerCase()
    .replaceAll("_", "-");
}

function errorText(error) {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "Request failed"
  );
}

function Status({ value }) {
  return (
    <span className={`status ${statusClass(value)}`}>
      {readable(value)}
    </span>
  );
}

function Priority({ value }) {
  return (
    <span
      className={`priority-${String(
        value || "medium"
      ).toLowerCase()}`}
    >
      {readable(value)}
    </span>
  );
}

function Details({ complaint, showAi = false }) {
  if (!complaint) return null;

  return (
    <div className="details">
      <div>
        <span>Tracking Code</span>
        <strong>{complaint.complaintCode}</strong>
      </div>

      <div>
        <span>Citizen</span>
        <strong>{complaint.citizenName}</strong>
      </div>

      <div>
        <span>Location</span>
        <strong>{complaint.location}</strong>
      </div>

      <div>
        <span>Category</span>
        <strong>{readable(complaint.category)}</strong>
      </div>

      <div>
        <span>Priority</span>
        <strong>
          <Priority value={complaint.priority} />
        </strong>
      </div>

      <div>
        <span>Department</span>
        <strong>{readable(complaint.department)}</strong>
      </div>

      <div>
        <span>Status</span>
        <strong>
          <Status value={complaint.status} />
        </strong>
      </div>

      <div>
        <span>Escalated</span>
        <strong>{complaint.escalated ? "Yes" : "No"}</strong>
      </div>

      <div className="wide">
        <span>Description</span>
        <strong>{complaint.description}</strong>
      </div>

      {complaint.photoUrl && <div className="wide" style={{gridColumn:"1 / -1"}}>
        <span>Photo Evidence</span>
        <a href={complaint.photoUrl.startsWith("http") ? complaint.photoUrl : `http://localhost:8081${complaint.photoUrl}`} target="_blank" rel="noopener noreferrer">View uploaded photo</a>
        <img src={complaint.photoUrl.startsWith("http") ? complaint.photoUrl : `http://localhost:8081${complaint.photoUrl}`} alt="Complaint evidence" style={{display:"block",maxWidth:340,width:"100%",borderRadius:12,marginTop:10}} />
      </div>}

      {showAi && <div className="wide" style={{
        gridColumn: "1 / -1", background: "linear-gradient(135deg,#eef4ff,#f7faff)",
        border: "1px solid #bfd4ff", borderRadius: 16, padding: 18,
        display: "flex", flexDirection: "column", gap: 14
      }}>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <Sparkles size={22} color="#2563eb" />
          <strong style={{fontSize:18,color:"#173a75"}}>Gemini AI Incident Briefing</strong>
          <span style={{marginLeft:"auto",fontSize:12,color:"#2563eb",fontWeight:700}}>AI-ASSISTED ASSESSMENT</span>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <span style={{padding:"6px 10px",borderRadius:8,background:"white",fontWeight:700,color:"#1e40af"}}>
            {readable(complaint.category)}
          </span>
          <span style={{padding:"6px 10px",borderRadius:8,background:complaint.priority === "CRITICAL" ? "#fee2e2" : "#fef3c7",color:complaint.priority === "CRITICAL" ? "#b91c1c" : "#92400e",fontWeight:700}}>
            {readable(complaint.priority)} PRIORITY
          </span>
          <span style={{padding:"6px 10px",borderRadius:8,background:complaint.needsHumanReview ? "#fee2e2" : "#e0f2fe",color:complaint.needsHumanReview ? "#b91c1c" : "#075985",fontWeight:700}}>
            {complaint.aiSummary || complaint.suggestedAction ? (complaint.needsHumanReview ? "Human review required" : "Human review not flagged") : "Review not assessed"}
          </span>
        </div>
        <div style={{display:"grid",gap:5}}>
          <span style={{fontSize:12,fontWeight:800,color:"#4b6593",letterSpacing:".06em"}}>AI SUMMARY</span>
          <strong style={{color:"#172d51",lineHeight:1.6}}>{complaint.aiSummary || "No AI summary stored for this complaint."}</strong>
        </div>
        <div style={{background:"white",padding:14,borderRadius:10,border:"1px solid #dbeafe",display:"grid",gap:5}}>
          <span style={{fontSize:12,fontWeight:800,color:"#2563eb",letterSpacing:".06em"}}>RECOMMENDED NEXT ACTION</span>
          <strong style={{color:"#172d51",lineHeight:1.6}}>{complaint.suggestedAction || "No suggested action stored for this complaint."}</strong>
        </div>
        <div style={{display:"grid",gap:5}}>
          <span style={{fontSize:12,fontWeight:800,color:"#4b6593",letterSpacing:".06em"}}>AI REASONING</span>
          <strong style={{color:"#172d51",lineHeight:1.6}}>{complaint.aiReason || "Not available"}</strong>
        </div>
        <small style={{color:"#64748b"}}>AI recommendations support human decisions; they do not dispatch emergency services.</small>
      </div>}
    </div>
  );
}

// Prototype feedback is stored only in this browser. Backend persistence is needed for production.
const feedbackStorageKey = (code) => `ug_resolution_feedback_${code}`;

function ResolutionFeedback({ complaint, onSaved }) {
  const [choice, setChoice] = useState("YES");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem(feedbackStorageKey(complaint.complaintCode)) || "null"); }
    catch { return null; }
  });
  useEffect(() => {
    try { setSaved(JSON.parse(localStorage.getItem(feedbackStorageKey(complaint.complaintCode)) || "null")); }
    catch { setSaved(null); }
    setChoice("YES"); setNote("");
  }, [complaint.complaintCode]);
  if (complaint.status !== "RESOLVED") return null;
  const labels = { YES: "Confirmed fixed", PARTIAL: "Partially fixed", NO: "Not fixed" };
  return <section style={{marginTop:20,padding:20,border:"1px solid #bfdbfe",borderRadius:16,background:"#f0f6ff"}}>
    <h3 style={{margin:"0 0 8px",color:"#1d4ed8"}}>Citizen Resolution Verification</h3>
    <p style={{margin:"0 0 14px"}}>The authority marked this complaint resolved. Was your issue actually fixed?</p>
    {saved ? <div>
      <strong style={{color:saved.choice === "YES" ? "#047857" : "#b45309"}}>Your feedback: {labels[saved.choice]}</strong>
      {saved.note && <p style={{marginTop:8}}>Comment: {saved.note}</p>}
      <p style={{fontSize:12,color:"#64748b"}}>Feedback saved in this browser for demonstration. It has not changed the complaint's official status.</p>
    </div> : <form onSubmit={e=>{
      e.preventDefault();
      const value = {choice, note:note.trim(), submittedAt:new Date().toISOString()};
      try {localStorage.setItem(feedbackStorageKey(complaint.complaintCode), JSON.stringify(value)); setSaved(value); onSaved?.();}
      catch {alert("Could not save feedback in this browser.");}
    }}>
      <div style={{display:"flex",flexWrap:"wrap",gap:14,marginBottom:12}}>
        {[["YES","Yes, fixed"],["PARTIAL","Partially fixed"],["NO","Not fixed"]].map(([value,label])=><label key={value} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}><input type="radio" name="resolution-verification" checked={choice===value} onChange={()=>setChoice(value)}/>{label}</label>)}
      </div>
      <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Optional: What still needs attention?" rows={2} style={{width:"100%",padding:10,border:"1px solid #cbd5e1",borderRadius:8,boxSizing:"border-box"}}/>
      <button type="submit" className="primary-btn" style={{marginTop:10}}>Submit Verification</button>
      <p style={{fontSize:12,color:"#64748b",marginTop:10}}>Prototype: feedback is saved locally on this device only; it does not reopen or notify the authority.</p>
    </form>}
  </section>;
}

function AdminFeedbackSummary({ complaint }) {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(feedbackStorageKey(complaint.complaintCode)) || "null"); } catch {}
  if (!saved) return null;
  const labels = { YES: "Citizen confirmed fixed", PARTIAL: "Citizen says partially fixed", NO: "Citizen says not fixed" };
  return <div style={{padding:16,marginTop:12,background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:12}}>
    <strong>Citizen verification (this browser): {labels[saved.choice] || "Feedback received"}</strong>
    {saved.note && <p>{saved.note}</p>}
    <small>Demo-only feedback, not synchronized to the backend.</small>
  </div>;
}

function Bars({ title, rows, total }) {
  return (
    <section className="panel chart-panel">
      <h2>{title}</h2>

      {rows.length === 0 ? (
        <p>No complaints to analyze yet.</p>
      ) : (
        rows.map(([name, count]) => (
          <div className="bar-row" key={name}>
            <div className="bar-label">
              <span>{readable(name)}</span>
              <strong>{count}</strong>
            </div>

            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${
                    (count / Math.max(total, 1)) * 100
                  }%`
                }}
              />
            </div>
          </div>
        ))
      )}
    </section>
  );
}

function DonutChart({ title, rows, colors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"] }) {
  const total = rows.reduce((sum, [, value]) => sum + value, 0);
  let running = 0;
  const segments = rows.map(([label, value], index) => {
    const start = running;
    running += value;
    return { label, value, color: colors[index % colors.length], start, fraction: total ? value / total : 0 };
  });
  const gradient = total ? `conic-gradient(${segments.map((part) => `${part.color} ${(part.start / total) * 100}% ${((part.start + part.value) / total) * 100}%`).join(", ")})` : "#e8eef7";
  return (
    <section className="panel ug-donut-panel">
      <div className="ug-chart-heading"><div><span className="ug-kicker">LIVE DATA INSIGHTS</span><h2>{title}</h2></div><span className="ug-chart-count">{total} records</span></div>
      <div className="ug-donut-content">
        <div className="ug-donut" style={{ background: gradient }} role="img" aria-label={`${title}: ${segments.map(p => `${readable(p.label)} ${p.value}`).join(", ") || "No data"}`}>
          <div className="ug-donut-hole"><strong>{total}</strong><span>Total cases</span></div>
        </div>
        <div className="ug-donut-legend">
          {segments.length ? segments.map(part => <div className="ug-legend-row" key={part.label}><span className="ug-legend-dot" style={{ background: part.color }} /><span className="ug-legend-name">{readable(part.label)}</span><strong>{total ? Math.round(part.value / total * 100) : 0}%</strong><small>{part.value}</small></div>) : <p>No complaints yet</p>}
        </div>
      </div>
    </section>
  );
}

function ActivityChart({ complaints }) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - (6 - index));
    const next = new Date(date); next.setDate(next.getDate() + 1);
    const count = complaints.filter(c => { const t = new Date(c.createdAt); return !Number.isNaN(t.getTime()) && t >= date && t < next; }).length;
    return { label: date.toLocaleDateString(undefined, { weekday: "short" }), count };
  });
  const max = Math.max(1, ...days.map(d => d.count));
  return <section className="panel ug-activity-panel"><div className="ug-chart-heading"><div><span className="ug-kicker">LAST 7 DAYS</span><h2>Complaint Activity</h2></div><span className="ug-chart-count">New registrations</span></div><div className="ug-activity-bars">{days.map((day, i) => <div className="ug-activity-day" key={i}><strong>{day.count || ""}</strong><div className="ug-activity-track"><div className="ug-activity-fill" style={{ height: `${day.count ? Math.max(9, day.count / max * 100) : 3}%` }} /></div><span>{day.label}</span></div>)}</div></section>;
}

function Nav({
  id,
  icon: Icon,
  children,
  page,
  navigate
}) {
  return (
    <button
      type="button"
      className={`nav ${page === id ? "active" : ""}`}
      onClick={() => navigate(id)}
    >
      <Icon size={19} />
      {children}
    </button>
  );
}

function Stats({ stats, complaints }) {
  const resolved = complaints.filter(
    (c) => c.status === "RESOLVED"
  ).length;

  const escalated = complaints.filter(
    (c) => c.escalated || c.status === "ESCALATED"
  ).length;

  const items = [
    [
      "Total Complaints",
      stats?.total ?? complaints.length,
      FilePlus2
    ],
    [
      "Submitted",
      stats?.submitted ??
        complaints.filter(
          (c) => c.status === "SUBMITTED"
        ).length,
      Clock
    ],
    [
      "In Progress",
      stats?.inProgress ??
        complaints.filter(
          (c) => c.status === "IN_PROGRESS"
        ).length,
      RefreshCw
    ],
    [
      "Resolved",
      stats?.resolved ?? resolved,
      CheckCircle2
    ],
    [
      "Escalated",
      stats?.escalated ?? escalated,
      AlertTriangle
    ],
    [
      "Critical",
      complaints.filter(
        (c) => c.priority === "CRITICAL"
      ).length,
      Activity
    ]
  ];

  return (
    <div className="stat-grid">
      {items.map(([label, value, Icon]) => (
        <div className="stat-card" key={label}>
          <Icon className="stat-icon" size={21} />
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      ))}
    </div>
  );
}

function ComplaintsTable({
  rows,
  editable,
  updateStatus,
  onView
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Tracking Code</th>
            <th>Citizen</th>
            <th>Location</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Department</th>
            <th>Status</th>
            {editable && <th>Action</th>}
          </tr>
        </thead>

        <tbody>
          {rows.map((c) => (
            <tr key={c.id} style={(c.status === "ESCALATED" || (c.escalated && c.status !== "RESOLVED")) ? { backgroundColor: "#fff1f2" } : undefined}>
              <td className="code-cell">
  <button
    type="button"
    className="complaint-link"
    onClick={() => onView(c)}
  >
    {c.complaintCode}
  </button>
</td>

              <td>{c.citizenName}</td>
              <td>{c.location}</td>
              <td>{readable(c.category)}</td>

              <td>
                <Priority value={c.priority} />
              </td>

              <td>{readable(c.department)}</td>

              <td>
                <Status value={c.status} />

                {(c.escalated && c.status !== "ESCALATED" && c.status !== "RESOLVED") && (
                    <small className="escalated-note">
                      Escalated
                    </small>
                  )}
              </td>

              {editable && (
                <td>
                  {c.status === "RESOLVED" ? (
                    <span style={{ color: "#047857", fontWeight: 700 }}>Completed · Locked</span>
                  ) : (
                  <select
                    aria-label={`Update ${c.complaintCode}`}
                    value={
                      c.status === "ESCALATED"
                        ? ""
                        : c.status
                    }
                    onChange={(e) =>
                      updateStatus(
                        c.id,
                        e.target.value
                      )
                    }
                  >
                    {c.status === "ESCALATED" && (
                      <option value="">
                        Select action
                      </option>
                    )}

                    <option value="SUBMITTED">
                      Submitted
                    </option>

                    <option value="IN_PROGRESS">
                      In Progress
                    </option>

                    <option value="RESOLVED">
                      Resolved
                    </option>
                  </select>
                  )}
                </td>
              )}
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td
                colSpan={editable ? 8 : 7}
                className="empty-row"
              >
                No complaints found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [chatMessages, setChatMessages] = useState([{role:"assistant",content:"Hi! I can help you report civic issues, track complaints, and understand complaint statuses. What would you like to know?"}]);
  const sendChat = async (event) => {
    event.preventDefault();
    const question = chatInput.trim();
    if (!question || chatBusy) return;
    const previous = chatMessages;
    setChatInput("");
    setChatMessages(items => [...items, {role:"user",content:question}]);
    setChatBusy(true);
    try {
      const response = await axios.post("http://127.0.0.1:8003/chat", {
        message:question,
        history:previous.filter(m => m.role === "user" || m.role === "assistant").slice(-10)
      }, {timeout:30000});
      setChatMessages(items => [...items, {role:"assistant",content:response.data.reply}]);
    } catch (error) {
      setChatMessages(items => [...items, {role:"assistant",content:"The AI assistant is unavailable right now. Please check that the Python AI service is running."}]);
    } finally { setChatBusy(false); }
  };

  const [adminUsername, setAdminUsername] = useState("admin");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminSession, setAdminSession] = useState(null);
  const [loginError, setLoginError] = useState("");
const [portal, setPortal] = useState("citizen");
  const [form, setForm] = useState(initialForm);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoNotice, setPhotoNotice] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const choosePhoto = (file) => {
    if (!file) { setPhoto(null); setPhotoPreview(""); return; }
    if (!["image/jpeg", "image/png"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setPhotoNotice("Choose a JPG or PNG image under 5 MB."); return;
    }
    setPhoto(file);
    setPhotoNotice("");
  };
  useEffect(() => {
    if (!photo) { setPhotoPreview(""); return; }
    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);
  const uploadComplaintPhoto = async (id, file, uploadToken) => {
    const data = new FormData();
    data.append("file", file);
    const response = await axios.post(`${API}/${id}/photo`, data, {
      headers: { "X-Complaint-Upload-Token": uploadToken },
      timeout: 30000
    });
    return response.data;
  };
  const [result, setResult] = useState(null);
  const [citizenHistory, setCitizenHistory] = useState(readCitizenHistory);
  const [historyDetails, setHistoryDetails] = useState({});

  const [trackingCode, setTrackingCode] =
    useState("");

  const [tracked, setTracked] = useState(null);

  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] =
    useState([]);

  const [loading, setLoading] = useState(false);

  const [dashboardLoading, setDashboardLoading] =
    useState(false);

  const [message, setMessage] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [analyticsArea, setAnalyticsArea] = useState("ALL");
  const [analyticsQuery, setAnalyticsQuery] = useState("");
  const [analyticsPriority, setAnalyticsPriority] = useState("ALL");
  const [locationState, setLocationState] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [locationArea, setLocationArea] = useState("");
  const [locationLandmark, setLocationLandmark] = useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [priorityFilter, setPriorityFilter] =
    useState("ALL");

  const [statusFilter, setStatusFilter] =
    useState("ALL");
  const [quickView, setQuickView] = useState("ESCALATED");

  const navigate = (next) => {
    setPage(next);
    setMessage("");
  };

  const adminAuth = (session) => ({
    auth: { username: session.username, password: session.password }
  });

  const loadDashboard = async (session = adminSession) => {
    if (!session) return;
    setDashboardLoading(true);
    try {
      const [statsResponse, complaintsResponse] = await Promise.all([
        axios.get(`${API}/dashboard`, adminAuth(session)),
        axios.get(API, adminAuth(session))
      ]);
      setStats(statsResponse.data);
      setComplaints(Array.isArray(complaintsResponse.data) ? complaintsResponse.data : []);
      setMessage("");
    } catch (error) {
      setMessage("Unable to load complaints: " + errorText(error));
      if (error.response?.status === 401) {
        setAdminSession(null);
        setStats(null);
        setComplaints([]);
        setLoginError("Session expired. Please sign in again.");
      }
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    if (adminPages.includes(page) && adminSession) {
      loadDashboard(adminSession);
    }
  }, [page, adminSession]);

  const loginAdmin = async (event) => {
    event.preventDefault();
    setLoginError("");
    const session = { username: adminUsername.trim(), password: adminPassword };
    try {
      await axios.get(`${API}/dashboard`, adminAuth(session));
      setAdminSession(session);
      setAdminPassword("");
      setPage("dashboard");
    } catch (error) {
      setLoginError(error.response?.status === 401
        ? "Incorrect administrator username or password."
        : "Login failed: " + errorText(error));
    }
  };

  const logoutAdmin = () => {
    setAdminSession(null);
    setAdminPassword("");
    setStats(null);
    setComplaints([]);
    setSelectedComplaint(null);
    setPortal("citizen");
    navigate("home");
  };

  const submitComplaint = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setResult(null);
    setPhotoNotice("");

    try {
      const structured = [locationArea === "Other area" ? "" : locationArea, locationCity, locationState].filter(Boolean).join(", ");
      const location = [structured, locationLandmark.trim() || form.location.trim()].filter(Boolean).join(" — ");
      if (!location) { setMessage("Please choose a location or enter an area/landmark."); return; }
      const response = await axios.post(API, { ...form, location });

      if (photo) {
        const uploadToken = response.headers["x-complaint-upload-token"];
        if (!uploadToken || !response.data?.id) {
          setPhotoNotice("Complaint created, but photo upload authorization was not returned. Photo not saved.");
        } else {
          setUploadingPhoto(true);
          try {
            const uploaded = await uploadComplaintPhoto(response.data.id, photo, uploadToken);
            response.data.photoUrl = uploaded.photoUrl;
            setPhoto(null);
            setPhotoNotice("Photo evidence uploaded successfully.");
          } catch (uploadError) {
            setPhotoNotice("Complaint created, but photo upload failed: " + errorText(uploadError));
          } finally {
            setUploadingPhoto(false);
          }
        }
      }
      setResult(response.data);
      const newCode = response.data?.complaintCode;
      if (newCode) {
        setCitizenHistory(previous => {
          const updated = [{code:newCode, description:form.description, location, category:response.data?.category, status:response.data?.status}, ...previous.filter(item => item.code !== newCode)];
          try { localStorage.setItem(citizenHistoryKey, JSON.stringify(updated)); } catch {}
          return updated;
        });
      }
      setForm(initialForm);
      setLocationState(""); setLocationCity(""); setLocationArea(""); setLocationLandmark("");
    } catch (error) {
      setMessage(
        "Submission failed: " +
          errorText(error)
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch up-to-date details for old and new codes whenever the citizen opens history.
  useEffect(() => {
    if (page !== "history" || citizenHistory.length === 0) return;
    let cancelled = false;
    Promise.all(citizenHistory.map(async item => {
      try {
        const response = await axios.get(`${API}/track/${encodeURIComponent(item.code)}`);
        return [item.code, response.data];
      } catch { return [item.code, null]; }
    })).then(entries => { if (!cancelled) setHistoryDetails(Object.fromEntries(entries)); });
    return () => { cancelled = true; };
  }, [page, citizenHistory]);

  const trackComplaint = async (event) => {
    event?.preventDefault();

    if (!trackingCode.trim()) return;

    setLoading(true);
    setMessage("");
    setTracked(null);

    try {
      const response = await axios.get(
        `${API}/track/${encodeURIComponent(
          trackingCode.trim()
        )}`
      );

      setTracked(response.data);
    } catch (error) {
      setMessage(
        error.response?.status === 404
          ? "Complaint not found. Check your tracking code."
          : "Tracking failed: " +
              errorText(error)
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    const existing = complaints.find(c => c.id === id);
    if (!existing || existing.status === "RESOLVED" || !status) return;
    try {
      await axios.put(
        `${API}/${id}/status`,
        { status },
        adminAuth(adminSession)
      );

      await loadDashboard();
    } catch (error) {
      setMessage(
        "Status update failed: " +
          errorText(error)
      );
    }
  };

  const filtered = complaints.filter((c) => {
    const q = searchQuery
      .toLowerCase()
      .trim();

    const matchesSearch = [
      c.complaintCode,
      c.citizenName,
      c.location,
      c.category,
      c.department,
      c.description
    ].some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(q)
    );

    const matchesPriority =
      priorityFilter === "ALL" ||
      c.priority === priorityFilter;

    const matchesStatus =
      statusFilter === "ALL" ||
      c.status === statusFilter ||
      (
        statusFilter === "ESCALATED" &&
        c.escalated
      );

    const matchesQuickView =
      (quickView === "ALL" && c.status !== "RESOLVED") ||
      (quickView === "ESCALATED" && c.status !== "RESOLVED" && (c.status === "ESCALATED" || c.escalated)) ||
      (quickView === "CRITICAL" && c.priority === "CRITICAL" && c.status !== "RESOLVED") ||
      (quickView === "SUBMITTED" && c.status === "SUBMITTED") ||
      (quickView === "IN_PROGRESS" && c.status === "IN_PROGRESS") ||
      (quickView === "RESOLVED" && c.status === "RESOLVED");

    return matchesSearch && matchesPriority && matchesStatus && matchesQuickView;
  }).sort((a, b) => {
    const urgency = c => (c.status === "RESOLVED" ? 0 : 100) +
      ((c.status === "ESCALATED" || c.escalated) ? 50 : 0) +
      ({ CRITICAL: 40, HIGH: 30, MEDIUM: 20, LOW: 10 }[c.priority] || 0);
    return urgency(b) - urgency(a) || new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const exportCSV = (rows = filtered) => {
    const columns = [
      "complaintCode",
      "citizenName",
      "citizenEmail",
      "location",
      "description",
      "category",
      "priority",
      "department",
      "status",
      "escalated",
      "createdAt"
    ];

    const csv = [
      columns.join(","),
      ...rows.map((c) =>
        columns
          .map((key) =>
            `"${String(
              c[key] ?? ""
            ).replaceAll('"', '""')}"`
          )
          .join(",")
      )
    ].join("\r\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      {
        type: "text/csv;charset=utf-8"
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "UrbanGuardian_Complaints.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const counts = (field) => {
    const grouped = complaints.reduce(
      (acc, c) => {
        const key =
          c[field] || "UNCLASSIFIED";

        acc[key] =
          (acc[key] || 0) + 1;

        return acc;
      },
      {}
    );

    return Object.entries(grouped).sort(
      (a, b) => b[1] - a[1]
    );
  };

  const total = complaints.length;

  const resolved = complaints.filter(
    (c) => c.status === "RESOLVED"
  ).length;

  const escalated = complaints.filter(
    (c) =>
      c.escalated ||
      c.status === "ESCALATED"
  ).length;

  const critical = complaints.filter(
    (c) => c.priority === "CRITICAL"
  ).length;

  const resolutionRate = total
    ? Math.round((resolved / total) * 100)
    : 0;

  // Location is currently free text in the database, not structured state/city fields.
  const analyticsComplaints = complaints.filter(c => {
    const area = String(c.location || "").trim();
    return (analyticsArea === "ALL" || parseArea(area).toLowerCase() === analyticsArea.toLowerCase()) &&
      (analyticsPriority === "ALL" || c.priority === analyticsPriority) &&
      [c.location, c.category, c.department, c.complaintCode].some(v =>
        String(v || "").toLowerCase().includes(analyticsQuery.trim().toLowerCase())
      );
  });
  const hotspotRows = Object.entries(complaints.reduce((acc,c) => {const key=parseArea(c.location);acc[key]=(acc[key]||0)+1;return acc;},{})).sort((a,b)=>b[1]-a[1]);
  const analyticsTotal = analyticsComplaints.length;
  const actionQueue = [...complaints].filter(c => c.status !== "RESOLVED").sort((a,b) => {
    const rank = p => ({CRITICAL:4,HIGH:3,MEDIUM:2,LOW:1}[p] || 0);
    return (Number(Boolean(b.escalated))*10 + rank(b.priority)) - (Number(Boolean(a.escalated))*10 + rank(a.priority));
  }).slice(0,5);
  const analyticsResolved = analyticsComplaints.filter(c => c.status === "RESOLVED").length;
  const analyticsCritical = analyticsComplaints.filter(c => c.priority === "CRITICAL").length;
  const analyticsEscalated = analyticsComplaints.filter(c => c.escalated || c.status === "ESCALATED").length;
  const analyticsRate = analyticsTotal ? Math.round(100 * analyticsResolved / analyticsTotal) : 0;
  const analyticsCounts = (field) => Object.entries(analyticsComplaints.reduce((acc,c) => {
    const key = String(c[field] || "UNCLASSIFIED");
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {})).sort((a,b) => b[1] - a[1]);

  const pageInfo = {
    home: [
      "Welcome to UrbanGuardian AI",
      "A smarter way to report and resolve civic issues."
    ],
    submit: [
      "Submit a Complaint",
      "Report a civic issue and receive an automatically generated tracking code."
    ],
    history: [
      "My Previous Complaints",
      "Find saved complaint codes and check their latest status."
    ],
    track: [
      "Track Your Complaint",
      "See the latest status, assigned department, and classification."
    ],
    dashboard: [
      "Admin Dashboard",
      "Monitor complaint activity and resolution progress."
    ],
    manage: [
      "Manage Complaints",
      "Search, filter, and update registered civic grievances."
    ],
    analytics: [
      "Analytics & Reports",
      "Explore complaint trends and department workload."
    ]
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <ShieldCheck size={32} />

          <div>
            <strong>UrbanGuardian</strong>
            <small>AI Civic Platform</small>
          </div>
        </div>

        
<div className="portal-switch">
  <button
    type="button"
    className={portal === "citizen" ? "portal-active" : ""}
    onClick={() => {
      setPortal("citizen");
      navigate("home");
    }}
  >
    Citizen
  </button>

  <button
    type="button"
    className={portal === "admin" ? "portal-active" : ""}
    onClick={() => {
      setPortal("admin");
      navigate("dashboard");
    }}
  >
    Admin
  </button>
</div>

{portal === "citizen" ? (
  <>
    <div className="menu-label">CITIZEN PORTAL</div>

    <Nav id="home" icon={House} page={page} navigate={navigate}>
      Home
    </Nav>

    <Nav id="submit" icon={FilePlus2} page={page} navigate={navigate}>
      Submit Complaint
    </Nav>

    <Nav id="track" icon={Search} page={page} navigate={navigate}>
      Track Complaint
    </Nav>
    <Nav id="history" icon={ClipboardList} page={page} navigate={navigate}>
      My Complaints
    </Nav>
  </>
) : (
  <>
    <div className="menu-label">AUTHORITY PORTAL</div>

    <Nav id="dashboard" icon={LayoutDashboard} page={page} navigate={navigate}>
      Dashboard
    </Nav>

    <Nav id="manage" icon={ClipboardList} page={page} navigate={navigate}>
      Manage Complaints
    </Nav>

    <Nav id="analytics" icon={ChartNoAxesColumn} page={page} navigate={navigate}>
      Analytics & Reports
    </Nav>
  </>
)}

        {adminSession && (
          <button type="button" className="nav" onClick={logoutAdmin}>
            <ShieldCheck size={19} /> Log out
          </button>
        )}
        <div className="sidebar-bottom">
          <span className="online-dot" />
          Spring Boot Microservices
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <div className="eyebrow">
              SMART CITY GRIEVANCE MANAGEMENT ·{" "}
              {adminPages.includes(page)
                ? "AUTHORITY VIEW"
                : "CITIZEN VIEW"}
            </div>

            <h1>{pageInfo[page][0]}</h1>

            <p>{pageInfo[page][1]}</p>
          </div>

          <div className="header-badge">
            <span className="online-dot" />
            UrbanGuardian AI
          </div>
        </header>

        {message && (
          <div
            role="alert"
            className="error-box"
          >
            {message}
          </div>
        )}

        {/* HOME PAGE */}
        {page === "home" && (
          <>
            <section className="hero-panel">
              <div className="hero-kicker">
                <Sparkles size={16} />
                SMARTER CIVIC SERVICES
              </div>

              <h2>
                Your city. Your voice.
                <br />
                A better tomorrow.
              </h2>

              <p>
                Report problems in your neighborhood,
                get automated category and priority
                identification, and track progress
                with a unique grievance code.
              </p>

              <div className="hero-actions">
                <button
                  className="primary-btn"
                  onClick={() =>
                    navigate("submit")
                  }
                >
                  Report an Issue
                  <ArrowRight size={17} />
                </button>

                <button
                  className="secondary-btn"
                  onClick={() =>
                    navigate("track")
                  }
                >
                  Track a Complaint
                </button>
              </div>
            </section>

            <div className="feature-grid">
              <div className="panel feature-card">
                <FilePlus2 size={25} />
                <h3>Easy Reporting</h3>
                <p>
                  Describe road damage,
                  sanitation, drainage,
                  water, and other civic issues.
                </p>
              </div>

              <div className="panel feature-card">
                <Activity size={25} />
                <h3>
                  Intelligent Classification
                </h3>
                <p>
                  Our analysis service detects
                  issue categories, urgency,
                  and responsible departments.
                </p>
              </div>

              <div className="panel feature-card">
                <MapPin size={25} />
                <h3>Transparent Tracking</h3>
                <p>
                  Use your tracking code to
                  check progress and escalation.
                </p>
              </div>
            </div>

            <section className="panel how-panel">
              <h2>
                How UrbanGuardian Works
              </h2>

              <div className="steps">
                <div>
                  <b>01</b>
                  <strong>Submit</strong>
                  <p>
                    Describe your civic concern
                  </p>
                </div>

                <div>
                  <b>02</b>
                  <strong>Analyze</strong>
                  <p>
                    Category, priority, department
                  </p>
                </div>

                <div>
                  <b>03</b>
                  <strong>Process</strong>
                  <p>
                    Authority updates the status
                  </p>
                </div>

                <div>
                  <b>04</b>
                  <strong>Track</strong>
                  <p>
                    Check progress and resolution
                  </p>
                </div>
              </div>
            </section>
          </>
        )}

        {/* SUBMIT COMPLAINT */}
        {page === "submit" && (
          <div className="content-grid">
            <section className="panel">
              <div className="section-heading">
                <FilePlus2 size={22} />

                <div>
                  <h2>New Grievance</h2>
                  <p>
                    Fill in the details below.
                  </p>
                </div>
              </div>

              {result && (
                <div className="panel result-panel" style={{marginBottom:20}}>
                  <div className="success-heading">
                    <CheckCircle2 size={24} />

                    <h3>
                      Complaint Registered!
                    </h3>
                  </div>

                  <p>
                    Save this tracking code:
                  </p>

                  <div className="tracking-highlight" title="Your unique complaint tracking code">
                    {result.complaintCode}
                  </div>
                  <button
  type="button"
  className="secondary-btn"
  onClick={async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(result.complaintCode);
      } else {
        const temp = document.createElement("textarea");
        temp.value = result.complaintCode;
        temp.style.position = "fixed";
        temp.style.opacity = "0";
        document.body.appendChild(temp);
        temp.select();
        const copied = document.execCommand("copy");
        temp.remove();
        if (!copied) throw new Error("Copy unavailable");
      }
      alert("Tracking code copied!");
    } catch {
      alert("Please copy the tracking code manually.");
    }
  }}
>
  Copy Tracking Code
</button>
                  {photoNotice && <p role="status" style={{fontWeight:600,color:"#92400e"}}>{photoNotice}</p>}
                  <p style={{fontSize:13,color:"#64748b",marginTop:12}}>Your complaint has been registered. AI assessment and recommended actions are available to administrators.</p>

                  <button
                    className="secondary-btn"
                    onClick={() => {
                      setTrackingCode(
                        result.complaintCode
                      );

                      setTracked(result);
                      navigate("track");
                    }}
                  >
                    Track This Complaint
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              <form onSubmit={submitComplaint}>
                <div className="form-grid">
                  <label>
                    Full Name

                    <input
                      required
                      maxLength={120}
                      placeholder="Enter your name"
                      value={form.citizenName}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          citizenName:
                            e.target.value
                        })
                      }
                    />
                  </label>

                  <label>
                    Email Address

                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={form.citizenEmail}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          citizenEmail:
                            e.target.value
                        })
                      }
                    />
                  </label>
                </div>

                <div className="ug-location-picker">
                  <div className="ug-location-head"><MapPin size={20}/><div><strong>Where is the issue?</strong><span>Select a location or enter one manually</span></div></div>
                  <div className="ug-location-grid">
                    <label>State
                      <select value={locationState} onChange={e => {setLocationState(e.target.value);setLocationCity("");setLocationArea("");}}>
                        <option value="">Select state</option>
                        {Object.keys(LOCATION_DIRECTORY).map(state => <option key={state} value={state}>{state}</option>)}
                      </select>
                    </label>
                    <label>City
                      <select value={locationCity} disabled={!locationState} onChange={e => {setLocationCity(e.target.value);setLocationArea("");}}>
                        <option value="">Select city</option>
                        {Object.keys(LOCATION_DIRECTORY[locationState] || {}).map(city => <option key={city} value={city}>{city}</option>)}
                      </select>
                    </label>
                    <label>Area / Neighborhood
                      <select value={locationArea} disabled={!locationCity} onChange={e => setLocationArea(e.target.value)}>
                        <option value="">Select area</option>
                        {(LOCATION_DIRECTORY[locationState]?.[locationCity] || []).map(area => <option key={area} value={area}>{area}</option>)}
                      </select>
                    </label>
                  </div>
                  <label>Landmark / street / custom location
                    <input placeholder="e.g. near metro station, or type your area manually" value={locationLandmark || form.location} onChange={e => {setLocationLandmark(e.target.value);setForm({...form,location:e.target.value});}} />
                  </label>
                  <p className="ug-location-note">The selected location is saved with your complaint. Areas outside the starter list can be entered manually.</p>
                </div>

                <label>
                  Describe Your Complaint

                  <textarea
                    required
                    minLength={10}
                    rows={6}
                    placeholder="Example: A large pothole on the main road is causing accidents..."
                    value={form.description}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        description:
                          e.target.value
                      })
                    }
                  />
                </label>

                <div style={{margin:"18px 0",padding:16,border:"1px dashed #93b4ee",borderRadius:12,background:"#f7faff"}}>
                  <label style={{display:"flex",alignItems:"center",gap:8,fontWeight:700}}><ImagePlus size={19}/> Photo Evidence (optional)
                    <input type="file" accept="image/jpeg,image/png" onChange={e=>choosePhoto(e.target.files?.[0])} style={{display:"block",marginTop:8}} />
                  </label>
                  {photoPreview && <img src={photoPreview} alt="Selected complaint evidence" style={{width:220,maxWidth:"100%",borderRadius:10,marginTop:12}} />}
                  <small style={{display:"block",marginTop:8,color:"#64748b"}}>JPG or PNG, maximum 5 MB. The photo will be uploaded after your complaint is registered.</small>
                </div>
                <button
                  className="primary-btn"
                  disabled={loading}
                >
                  {loading
                    ? "Submitting..."
                    : "Submit Complaint"}

                  <ArrowRight size={17} />
                </button>
              </form>
            </section>

            <section className="side-content">
              <div className="info-card">
                <ShieldCheck size={27} />

                <h3>
                  Intelligent Grievance Routing
                </h3>

                <p>
                  The analysis service identifies
                  a category, urgency, and department
                  from your description.
                </p>
              </div>


            </section>
          </div>
        )}

        {/* CITIZEN COMPLAINT HISTORY — saved in this browser only */}
        {page === "history" && (
          <section className="panel track-panel">
            <div className="section-heading">
              <ClipboardList size={23} />
              <div>
                <h2>My Previous Complaints</h2>
                <p>Codes saved on this browser after successful submissions.</p>
              </div>
            </div>
            {citizenHistory.length === 0 ? (
              <p>No saved complaints yet. Submit a complaint to see its code here.</p>
            ) : (
              <div style={{display:"grid", gap:12, marginTop:16}}>
                {citizenHistory.map(item => {
                  const complaint = historyDetails[item.code] || item;
                  const description = String(complaint.description || "").trim();
                  const title = description ? (description.length > 78 ? description.slice(0, 78) + "…" : description) : readable(complaint.category || "Complaint");
                  return (
                  <div key={item.code} style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap", padding:14, border:"1px solid #dbeafe", borderRadius:12}}>
                    <div style={{display:"grid", gap:6, flex:"1 1 250px", minWidth:0}}>
                      <strong style={{color:"#173a75", overflowWrap:"anywhere"}}>{title}</strong>
                      {complaint.location && <small style={{color:"#64748b"}}>{complaint.location}</small>}
                      <div style={{display:"flex", alignItems:"center", gap:10, flexWrap:"wrap"}}>
                        <span style={{color:"#2563eb", fontWeight:700}}>{item.code}</span>
                        {complaint.status && <Status value={complaint.status} />}
                      </div>
                    </div>
                    <button type="button" className="secondary-btn" onClick={() => {
                      setTrackingCode(item.code);
                      setTracked(null);
                      navigate("track");
                      setLoading(true);
                      axios.get(`${API}/track/${encodeURIComponent(item.code)}`)
                        .then(response => setTracked(response.data))
                        .catch(error => setMessage(error.response?.status === 404 ? "Complaint not found." : "Tracking failed: " + errorText(error)))
                        .finally(() => setLoading(false));
                    }}>Track Status <ArrowRight size={16} /></button>
                  </div>
                );})}
              </div>
            )}
            <p style={{fontSize:12, color:"#64748b", marginTop:16}}>
              This is a demo-only browser history. Clearing browser data or using another device will not show these codes.
            </p>
          </section>
        )}

        {/* TRACK COMPLAINT */}
        {page === "track" && (
          <section className="panel track-panel">
            <div className="section-heading">
              <Search size={23} />

              <div>
                <h2>Complaint Lookup</h2>

                <p>
                  Enter your unique grievance
                  tracking code.
                </p>
              </div>
            </div>

            <form
              className="track-form"
              onSubmit={trackComplaint}
            >
              <input
                required
                placeholder="Example: UG-C15A533B"
                value={trackingCode}
                onChange={(e) =>
                  setTrackingCode(
                    e.target.value
                  )
                }
              />

              <button
                className="primary-btn"
                disabled={loading}
              >
                {loading
                  ? "Searching..."
                  : "Track Status"}
              </button>
            </form>

            {tracked && (
              <div className="track-result">
                <div className="section-heading">
                  <CheckCircle2 size={22} />

                  <div>
                    <h2>Complaint Details</h2>

                    <p>
                      Latest information from
                      the Complaint Service
                    </p>
                  </div>
                </div>

                <div className="ug-tracking-summary">
                  <div className="ug-tracking-heading">
                    <span className="ug-tracking-kicker">CURRENT PROGRESS</span>
                    <Status value={tracked.status} />
                  </div>
                  <h3>{tracked.status === "RESOLVED" ? "Your complaint has been resolved" : tracked.status === "IN_PROGRESS" ? "Your complaint is being processed" : "Your complaint has been registered"}</h3>
                  <p>{tracked.status === "RESOLVED" ? "The authority has marked this grievance as resolved." : tracked.status === "IN_PROGRESS" ? "The responsible authority is working on this grievance." : "Your complaint is registered and awaiting an authority update."}</p>
                  {tracked.escalated && <div className="ug-escalation-note"><AlertTriangle size={17} /> This grievance has been escalated for attention.</div>}
                </div>
                <div className="ug-track-progress"><div className="ug-track-progress-top"><strong>Resolution journey</strong><span>{tracked.status === "RESOLVED" ? "100%" : tracked.status === "IN_PROGRESS" ? "66%" : "33%"} stage progress</span></div><div className="ug-track-progress-rail"><div style={{ width: tracked.status === "RESOLVED" ? "100%" : tracked.status === "IN_PROGRESS" ? "66%" : "33%" }} /></div></div>
                <div className="ug-timeline" aria-label="Complaint progress">
                  {[
                    ["SUBMITTED", "Submitted", "Complaint received"],
                    ["IN_PROGRESS", "In progress", "Authority review"],
                    ["RESOLVED", "Resolved", "Issue closed"]
                  ].map(([step, title, description], index) => {
                    const rank = { SUBMITTED: 0, IN_PROGRESS: 1, RESOLVED: 2 };
                    const active = (rank[tracked.status] ?? 0) >= index;
                    return <div className={`ug-timeline-step ${active ? "is-complete" : ""}`} key={step}>
                      <span className="ug-timeline-dot">{active ? <CheckCircle2 size={18} /> : index + 1}</span>
                      <div><strong>{title}</strong><small>{description}</small></div>
                    </div>;
                  })}
                </div>
                <Details complaint={tracked} />
                <ResolutionFeedback complaint={tracked} />
                <button type="button" className="secondary-btn ug-copy-btn" onClick={async () => {
                  try { await navigator.clipboard.writeText(tracked.complaintCode); setMessage("Tracking code copied to clipboard."); }
                  catch { setMessage("Could not copy automatically. Please select the code and copy it."); }
                }}>Copy Tracking Code</button>

                <button
                  className="secondary-btn"
                  onClick={() =>
                    trackComplaint()
                  }
                >
                  <RefreshCw size={16} />
                  Refresh Status
                </button>
              </div>
            )}
          </section>
        )}

        {/* CUSTOM ADMIN LOGIN */}
        {adminPages.includes(page) && !adminSession && (
          <section className="panel admin-login-panel">
            <ShieldCheck size={36} />
            <h2>Administrator Sign In</h2>
            <p>Sign in to view complaint records, manage statuses and access reports.</p>
            <form onSubmit={loginAdmin}>
              <label>Username
                <input required autoComplete="username" value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)} />
              </label>
              <label>Password
                <input required type="password" autoComplete="current-password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)} />
              </label>
              {loginError && <div className="error-box" role="alert">{loginError}</div>}
              <button type="submit" className="primary-btn">Sign In <ArrowRight size={16} /></button>
            </form>
          </section>
        )}

        {/* ADMIN SECTION */}
        {adminPages.includes(page) && adminSession && (
          <>
            <div className="dashboard-heading">
              <h2>
                {page === "dashboard"
                  ? "Complaint Overview"
                  : page === "manage"
                  ? "Complaint Records"
                  : "Grievance Insights"}
              </h2>

              <button
                className="secondary-btn"
                disabled={dashboardLoading}
                onClick={() => loadDashboard()}
              >
                <RefreshCw size={16} />

                {dashboardLoading
                  ? "Loading..."
                  : "Refresh Data"}
              </button>
            </div>

            <Stats
              stats={stats}
              complaints={complaints}
            />

            {/* DASHBOARD */}
            {page === "dashboard" && (
              <>
                <div className="ug-command-banner"><div><span className="ug-kicker">AUTHORITY COMMAND CENTER</span><h2>City grievance overview</h2><p>Monitor incoming reports, prioritize urgent cases, and track resolution progress in real time when refreshed.</p></div><div className="ug-command-metric"><strong>{total - resolved}</strong><span>Open cases</span></div></div>
              
{complaints.some(
  (c) =>
    c.priority === "CRITICAL" &&
    c.status !== "RESOLVED"
) && (
  <section className="critical-alert-panel">
    <div className="critical-alert-heading">
      <AlertTriangle size={24} />
      <div>
        <h2>Critical Grievance Alerts</h2>
        <p>Unresolved critical complaints requiring attention.</p>
      </div>
    </div>

    <div className="critical-alert-list">
      {complaints
        .filter(
          (c) =>
            c.priority === "CRITICAL" &&
            c.status !== "RESOLVED"
        )
        .slice(0, 5)
        .map((c) => (
          <div className="critical-alert-item" key={c.id}>
            <div>
              <strong>{c.complaintCode}</strong>
              <p>{readable(c.category)} · {c.location}</p>
            </div>
            <button
              type="button"
              className="critical-view-btn"
              onClick={() => setSelectedComplaint(c)}
            >
              View Details <ArrowRight size={15} />
            </button>
          </div>
        ))}
    </div>
  </section>
)}
                <section className="ug-ops-board">
                  <div className="ug-ops-title"><div><span className="ug-kicker">LIVE OPERATIONS BOARD</span><h2>Priority action queue</h2><p>Unresolved cases, ordered by escalation and urgency</p></div><button className="secondary-btn" onClick={() => navigate("manage")}>Manage all <ArrowRight size={16}/></button></div>
                  <div className="ug-queue-list">
                    {actionQueue.length ? actionQueue.map((c,i) => <button type="button" className="ug-queue-item" key={c.id} onClick={() => setSelectedComplaint(c)}>
                      <span className="ug-queue-rank">{String(i+1).padStart(2,"0")}</span>
                      <span className="ug-queue-info"><strong>{c.complaintCode}</strong><small>{readable(c.category)} · {c.location}</small></span>
                      <Priority value={c.priority}/><Status value={c.status}/><ArrowRight size={17}/>
                    </button>) : <p className="ug-queue-empty">No unresolved complaints. You're all caught up.</p>}
                  </div>
                </section>
                <div className="ug-admin-strip">
                  <div><span>Awaiting / in progress</span><strong>{total - resolved}</strong><small>Complaints not yet resolved</small></div>
                  <div><span>Unresolved critical</span><strong>{complaints.filter(c => c.priority === "CRITICAL" && c.status !== "RESOLVED").length}</strong><small>Requires urgent review</small></div>
                  <div><span>Resolution rate</span><strong>{resolutionRate}%</strong><small>Of all registered grievances</small></div>
                </div>
                <section className="panel resolution-panel">
                  <div className="resolution-header">
                    <div>
                      <h2>
                        Grievance Resolution Performance
                      </h2>

                      <p>
                        Overall progress of
                        registered civic complaints
                      </p>
                    </div>

                    <strong>
                      {resolutionRate}%
                    </strong>
                  </div>

                  <div className="resolution-track">
                    <div
                      className="resolution-fill"
                      style={{
                        width: `${resolutionRate}%`
                      }}
                    />
                  </div>

                  <div className="resolution-summary">
                    <span>
                      {resolved} Resolved
                    </span>

                    <span>
                      {total - resolved} Not Resolved
                    </span>
                  </div>
                </section>

                <section className="panel table-panel">
                  <div className="section-heading">
                    <LayoutDashboard size={22} />

                    <div>
                      <h2>
                        Recent Complaints
                      </h2>

                      <p>
                        Latest registered grievances
                        and their statuses.
                      </p>
                    </div>
                  </div>

                  <ComplaintsTable
                    rows={[...complaints]
                      .sort(
                        (a, b) =>
                          new Date(
                            b.createdAt || 0
                          ) -
                          new Date(
                            a.createdAt || 0
                          )
                      )
                      .slice(0, 8)}
                    editable={false}
                    updateStatus={updateStatus}
                    onView={setSelectedComplaint}
                  />

                  <button
                    className="secondary-btn view-all"
                    onClick={() =>
                      navigate("manage")
                    }
                  >
                    Manage All Complaints
                    <ArrowRight size={16} />
                  </button>
                </section>
              </>
            )}

            {/* MANAGE COMPLAINTS */}
            {page === "manage" && (
              <section className="panel table-panel">
                <div className="section-heading">
                  <ClipboardList size={22} />

                  <div>
                    <h2>Complaint Action Queue</h2>

                    <p>
                      Handle escalated and critical cases first. Resolved cases are archived in a read-only view.
                    </p>
                  </div>
                </div>

                <div className="ug-quick-summary" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(145px, 1fr))",gap:12,margin:"18px 0"}}>
                  {[
                    ["Escalated", complaints.filter(c => c.status === "ESCALATED" || (c.escalated && c.status !== "RESOLVED")).length, "#b91c1c", "#fff1f2"],
                    ["Open Critical", complaints.filter(c => c.priority === "CRITICAL" && c.status !== "RESOLVED").length, "#b45309", "#fffbeb"],
                    ["In Progress", complaints.filter(c => c.status === "IN_PROGRESS").length, "#1d4ed8", "#eff6ff"],
                    ["Resolved", complaints.filter(c => c.status === "RESOLVED").length, "#047857", "#ecfdf5"]
                  ].map(([label, count, color, background]) => (
                    <div key={label} style={{border:"1px solid #e2e8f0",borderRadius:12,padding:16,background}}>
                      <div style={{fontSize:13,fontWeight:600,color}}>{label}</div>
                      <div style={{fontSize:28,fontWeight:800,color,marginTop:6}}>{count}</div>
                    </div>
                  ))}
                </div>

                <div aria-label="Complaint quick views" style={{display:"flex",flexWrap:"wrap",gap:8,margin:"14px 0 18px"}}>
                  {[
                    ["ESCALATED", "Escalated"], ["CRITICAL", "Critical"],
                    ["ALL", "All Active"], ["RESOLVED", "Resolved"]
                  ].map(([value, label]) => (
                    <button key={value} type="button" onClick={() => {
                      setQuickView(value);
                      setPriorityFilter("ALL");
                      setStatusFilter("ALL");
                    }} style={{padding:"10px 14px",borderRadius:9,cursor:"pointer",fontWeight:600,
                      border: quickView === value ? "1px solid #2563eb" : "1px solid #cbd5e1",
                      background: quickView === value ? "#2563eb" : "#fff",
                      color: quickView === value ? "#fff" : "#334155"}}>
                      {label}
                    </button>
                  ))}
                </div>

                <div className="dashboard-filters">
                  <input
                    aria-label="Search complaints"
                    placeholder="Search code, citizen, location..."
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(
                        e.target.value
                      )
                    }
                  />

                  <select
                    aria-label="Priority filter"
                    value={priorityFilter}
                    onChange={(e) =>
                      setPriorityFilter(
                        e.target.value
                      )
                    }
                  >
                    <option value="ALL">
                      All Priorities
                    </option>

                    <option value="CRITICAL">
                      Critical
                    </option>

                    <option value="HIGH">
                      High
                    </option>

                    <option value="MEDIUM">
                      Medium
                    </option>

                    <option value="LOW">
                      Low
                    </option>
                  </select>

                  <select
                    aria-label="Status filter"
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value
                      )
                    }
                  >
                    <option value="ALL">
                      All Statuses
                    </option>

                    <option value="SUBMITTED">
                      Submitted
                    </option>

                    <option value="IN_PROGRESS">
                      In Progress
                    </option>

                    <option value="RESOLVED">
                      Resolved
                    </option>

                    <option value="ESCALATED">
                      Escalated
                    </option>
                  </select>

                  <button
                    className="secondary-btn"
                    onClick={() => exportCSV()}
                  >
                    <Download size={16} />
                    Export CSV
                  </button>
                </div>

                <p className="result-count">
                  {quickView === "ALL" ? "All Active" : ({ESCALATED:"Escalated",CRITICAL:"Critical",RESOLVED:"Resolved"}[quickView])}: Showing {filtered.length} complaints
                </p>

                <ComplaintsTable
                  rows={filtered}
                  editable={true}
                  updateStatus={updateStatus}
                    onView={setSelectedComplaint}
                />
              </section>
            )}

            {/* ANALYTICS */}
            {page === "analytics" && (
              <>
                <section className="ug-city-pulse">
                  <div className="ug-city-pulse-copy"><span className="ug-city-eyebrow"><Activity size={15}/> URBANGUARDIAN · CIVIC OPERATIONS</span><h2>UrbanGuardian <span>AI</span></h2><p>Explore complaint hotspots, identify urgent cases and take action from one dashboard.</p><div className="ug-pulse-actions"><button type="button" onClick={() => {setAnalyticsArea("ALL");setAnalyticsPriority("CRITICAL");}}>View critical cases <ArrowRight size={16}/></button><button type="button" onClick={() => navigate("manage")}>Open case manager</button></div></div>
                  <div className="ug-city-pulse-numbers"><div><strong>{total}</strong><span>Total reports</span></div><div><strong>{total-resolved}</strong><span>Open cases</span></div><div><strong>{critical}</strong><span>Critical reports</span></div><div><strong>{hotspotRows.length}</strong><span>Reported areas</span></div></div>
                </section>
                <section className="ug-hotspot-section"><div className="ug-hotspot-heading"><div><span className="ug-kicker">LOCATION INTELLIGENCE</span><h2>Explore neighborhood hotspots</h2><p>Click a location to filter every chart below</p></div><button type="button" className="secondary-btn" onClick={() => {setAnalyticsArea("ALL");setAnalyticsPriority("ALL");setAnalyticsQuery("");}}>Show all areas</button></div>
                  <div className="ug-hotspot-grid">{hotspotRows.length ? hotspotRows.slice(0,6).map(([area,count],i) => <button key={area} type="button" className={`ug-hotspot-card ${analyticsArea === area ? "is-selected" : ""}`} onClick={() => setAnalyticsArea(analyticsArea === area ? "ALL" : area)}><span className="ug-hotspot-icon"><MapPin size={19}/></span><span className="ug-hotspot-name">{area}</span><span className="ug-hotspot-count">{count} <small>{count === 1 ? "complaint" : "complaints"}</small></span><span className="ug-hotspot-meter"><i style={{width:`${100*count/Math.max(total,1)}%`}}/></span><span className="ug-hotspot-foot">{i === 0 ? "Top reported location" : "View area insights"} <ArrowRight size={14}/></span></button>) : <div className="ug-hotspot-empty">No locations yet. Submit a complaint to populate the geographic insights.</div>}</div>
                </section>
                <section className="ug-geo-toolbar">
                  <div className="ug-geo-title"><MapPin size={19}/><div><strong>Geographic intelligence</strong><span>Explore complaints by recorded location</span></div></div>
                  <label>Area / Location
                    <select value={analyticsArea} onChange={e => setAnalyticsArea(e.target.value)}>
                      <option value="ALL">All locations ({complaints.length})</option>
                      {hotspotRows.map(([area]) => <option value={area} key={area}>{area}</option>)}
                    </select>
                  </label>
                  <label>Priority
                    <select value={analyticsPriority} onChange={e => setAnalyticsPriority(e.target.value)}><option value="ALL">All priorities</option>{["CRITICAL","HIGH","MEDIUM","LOW"].map(p=><option key={p}>{p}</option>)}</select>
                  </label>
                  <label>Search insights
                    <input value={analyticsQuery} onChange={e => setAnalyticsQuery(e.target.value)} placeholder="Search location, category..." />
                  </label>
                  <button type="button" className="ug-clear-filter" onClick={() => {setAnalyticsArea("ALL"); setAnalyticsPriority("ALL"); setAnalyticsQuery("");}}>Reset filters</button>
                </section>
                <div className="ug-filter-count">Showing <strong>{analyticsTotal}</strong> of {total} complaints · Analytics update instantly when filters change</div>
                <div className="insight-grid">
                  <div className="panel insight">
                    <span>
                      Resolution Rate
                    </span>

                    <strong>
                      {analyticsRate}%
                    </strong>

                    <p>
                      {analyticsResolved} of {analyticsTotal}
                      {" "}complaints resolved
                    </p>
                  </div>

                  <div className="panel insight">
                    <span>
                      Critical Priority
                    </span>

                    <strong>
                      {analyticsCritical}
                    </strong>

                    <p>
                      Complaints requiring
                      urgent attention
                    </p>
                  </div>

                  <div className="panel insight">
                    <span>
                      Escalated Cases
                    </span>

                    <strong>
                      {analyticsEscalated}
                    </strong>

                    <p>
                      Complaints marked
                      as escalated
                    </p>
                  </div>
                </div>

                <div className="ug-analytics-intro"><div><span className="ug-kicker">VISUAL INTELLIGENCE CENTER</span><h2>Where complaints stand, at a glance</h2><p>Interactive-style visual summaries calculated from your real complaint records. Refresh Data for the latest figures.</p></div><span className="ug-live-chip"><span /> LIVE REPORT</span></div>
                <div className="ug-donut-grid">
                  <DonutChart title="Resolution Breakdown" rows={analyticsCounts("status")} colors={["#10b981", "#2563eb", "#f59e0b"]} />
                  <DonutChart title="Priority Distribution" rows={analyticsCounts("priority")} colors={["#ef4444", "#f59e0b", "#2563eb", "#10b981"]} />
                </div>
                <ActivityChart complaints={analyticsComplaints} />
                <section className="panel ug-area-panel">
                  <div className="ug-chart-heading"><div><span className="ug-kicker">GEOGRAPHIC OVERVIEW</span><h2>Complaint Hotspots by Reported Area</h2></div><span className="ug-chart-count">Based on citizen-entered locations</span></div>
                  {analyticsCounts("location").length ? <div className="ug-area-list">{analyticsCounts("location").slice(0,6).map(([area,count]) => <div className="ug-area-item" key={area}><MapPin size={17}/><span>{area}</span><div className="ug-area-rail"><div style={{width: `${100*count/Math.max(analyticsTotal,1)}%`}}/></div><strong>{count} {count === 1 ? "case" : "cases"}</strong></div>)}</div> : <p>No complaints match the current filters.</p>}
                  <p className="ug-area-note">This is a location summary, not a live GPS map. Locations are grouped as entered by citizens.</p>
                </section>
                <div className="analytics-grid">
                  <Bars
                    title="Complaints by Category"
                    rows={analyticsCounts("category")}
                    total={analyticsTotal}
                  />

                  <Bars
                    title="Complaints by Priority"
                    rows={analyticsCounts("priority")}
                    total={analyticsTotal}
                  />

                  <Bars
                    title="Complaints by Department"
                    rows={analyticsCounts("department")}
                    total={analyticsTotal}
                  />

                  <Bars
                    title="Complaints by Status"
                    rows={analyticsCounts("status")}
                    total={analyticsTotal}
                  />
                </div>

                <div className="panel report-note">
                  <Building2 size={20} />

                  <p>
                    Charts are calculated from
                    complaint records returned
                    by the Complaint Service.
                    Refresh to load the latest data.
                  </p>

                  <button
                    className="secondary-btn"
                    onClick={() => exportCSV(analyticsComplaints)}
                  >
                    <Download size={16} />
                    Export Filtered CSV
                  </button>
                </div>
              </>
            )}
          </>
        )}

        <footer>
          © 2026 UrbanGuardian AI · Smart Citizen
          Grievance Management · Academic Prototype
        </footer>
        
{selectedComplaint && adminSession && (
  <div
    className="modal-overlay"
    onClick={() => setSelectedComplaint(null)}
  >
    <div
      className="complaint-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Complaint details"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="modal-header">
        <div>
          <div className="eyebrow">GRIEVANCE RECORD</div>
          <h2>Complaint Details</h2>
          <p>{selectedComplaint.complaintCode}</p>
        </div>

        <button
          type="button"
          className="modal-close"
          aria-label="Close complaint details"
          onClick={() => setSelectedComplaint(null)}
        >
          ×
        </button>
      </div>

      <div className="modal-badges">
        <Priority value={selectedComplaint.priority} />
        <Status value={selectedComplaint.status} />
        {selectedComplaint.escalated && (
          <span className="status escalated">ESCALATED</span>
        )}
      </div>

      <Details complaint={selectedComplaint} showAi />
      <div style={{marginTop:16,padding:16,border:"1px solid #dbeafe",borderRadius:12}}>
        <strong>Citizen Photo Evidence</strong>
        {selectedComplaint.photoUrl ? (
          <p style={{fontSize:13,color:"#64748b"}}>The photo submitted for this complaint is displayed in the complaint details above.</p>
        ) : (
          <p style={{fontSize:13,color:"#64748b"}}>No photo evidence attached.</p>
        )}
      </div>
      {selectedComplaint.status === "RESOLVED" && <AdminFeedbackSummary complaint={selectedComplaint} />}

      {selectedComplaint.createdAt && (
        <p className="modal-date">
          Registered:{" "}
          {new Date(selectedComplaint.createdAt).toLocaleString()}
        </p>
      )}

      <div className="modal-actions">
        <button
          type="button"
          className="secondary-btn"
          onClick={() => setSelectedComplaint(null)}
        >
          Close
        </button>
        <button
          type="button"
          className="primary-btn"
          onClick={() => {
            setSelectedComplaint(null);
            navigate("manage");
          }}
        >
          Manage Complaint <ArrowRight size={16} />
        </button>
      </div>
    </div>
  </div>
)}
      </main>
      {portal === "citizen" && <div style={{position:"fixed",right:22,bottom:22,zIndex:9999,fontFamily:"inherit"}}>
        {chatOpen && <section aria-label="UrbanGuardian AI chat" style={{width:"min(370px, calc(100vw - 32px))",height:470,background:"white",border:"1px solid #c7d8f6",boxShadow:"0 12px 40px #1e3a8a33",borderRadius:18,display:"flex",flexDirection:"column",overflow:"hidden",marginBottom:12}}>
          <header style={{background:"#1d4ed8",color:"white",padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}><strong><MessageCircle size={18} style={{verticalAlign:"middle",marginRight:8}}/>UrbanGuardian AI Assistant</strong><button aria-label="Close assistant" type="button" onClick={()=>setChatOpen(false)} style={{background:"transparent",border:0,color:"white",cursor:"pointer"}}><X size={20}/></button></header>
          <div aria-live="polite" style={{flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:10}}>{chatMessages.map((m,i)=><div key={i} style={{alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"88%",padding:"10px 12px",borderRadius:12,whiteSpace:"pre-wrap",overflowWrap:"anywhere",background:m.role==="user"?"#2563eb":"#eff6ff",color:m.role==="user"?"white":"#1e3a5f",fontSize:13,lineHeight:1.5}}>{m.content}</div>)}{chatBusy && <small style={{color:"#64748b"}}>Assistant is thinking...</small>}</div>
          <form onSubmit={sendChat} style={{padding:12,display:"flex",gap:8,borderTop:"1px solid #e2e8f0"}}><input aria-label="Message AI assistant" value={chatInput} onChange={e=>setChatInput(e.target.value)} maxLength={2000} placeholder="Ask about a civic issue..." style={{flex:1,minWidth:0,padding:10,border:"1px solid #cbd5e1",borderRadius:9}}/><button aria-label="Send message" disabled={chatBusy || !chatInput.trim()} type="submit" style={{border:0,borderRadius:9,padding:11,background:"#2563eb",color:"white",cursor:"pointer"}}><Send size={18}/></button></form>
          <small style={{padding:"0 12px 10px",color:"#64748b"}}>AI guidance only · Not an emergency dispatch service</small>
        </section>}
        <button type="button" onClick={()=>setChatOpen(v=>!v)} style={{display:"flex",alignItems:"center",gap:9,marginLeft:"auto",border:0,borderRadius:30,background:"#2563eb",color:"white",padding:"13px 18px",fontWeight:700,boxShadow:"0 6px 20px #1e40af44",cursor:"pointer"}}><MessageCircle size={20}/>{chatOpen?"Close Assistant":"Ask UrbanGuardian AI"}</button>
      </div>}
    </div>
  );
}
