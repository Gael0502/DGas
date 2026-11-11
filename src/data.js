export const initialData = {
  orders: [
    { id: "DG-0248", customer: "Jean-Paul N.", customerId: "CUS-0278", region: "Gasabo", kg: 12, status: "Confirmed", created: "Today, 10:42", initials: "JN" },
    { id: "DG-0247", customer: "Mireille U.", customerId: "CUS-0269", region: "Kicukiro", kg: 6, status: "In progress", created: "Today, 09:18", initials: "MU" },
    { id: "DG-0246", customer: "Patrick H.", customerId: "CUS-0252", region: "Nyarugenge", kg: 12, status: "Confirmed", created: "Yesterday", initials: "PH" },
    { id: "DG-0245", customer: "Claudine A.", customerId: "CUS-0231", region: "Gasabo", kg: 6, status: "Confirmed", created: "Yesterday", initials: "CA" },
    { id: "DG-0244", customer: "Aline Mukamana", customerId: "CUS-0284", region: "Gasabo", kg: 12, status: "Delivered", created: "Oct 18, 2026", initials: "AM", demoPrice: 19300 },
    { id: "DG-0243", customer: "Eric N.", customerId: "CUS-0198", region: "Kicukiro", kg: 15, status: "Confirmed", created: "Nov 09, 2026", initials: "EN" }
  ],
  suppliers: [
    { id: "SUP-001", name: "Kigali Energy Hub", region: "Gasabo", contact: "Jean M.", capacity: 3200, performance: 96, status: "Active" },
    { id: "SUP-002", name: "GreenFlame Rwanda", region: "Nyarugenge", contact: "Claudine K.", capacity: 2600, performance: 92, status: "Active" },
    { id: "SUP-003", name: "CityGas Partners", region: "Kicukiro", contact: "Emmanuel R.", capacity: 2100, performance: 89, status: "Active" },
    { id: "SUP-004", name: "Northern Gas Co.", region: "Gasabo", contact: "Marie U.", capacity: 1800, performance: 84, status: "Review" },
    { id: "SUP-005", name: "Imena LPG Services", region: "Nyarugenge", contact: "Eric N.", capacity: 1400, performance: 91, status: "Active" }
  ],
  customers: [
    { id: "CUS-0284", name: "Aline Mukamana", email: "customer@directgas.rw", region: "Gasabo", phone: "+250 788 ••• 284", orders: 8, kg: 96, status: "Active", initials: "AM" },
    { id: "CUS-0278", name: "Jean-Paul Niyonzima", region: "Gasabo", phone: "+250 788 ••• 127", orders: 12, kg: 144, status: "Active", initials: "JN" },
    { id: "CUS-0269", name: "Mireille Uwase", region: "Kicukiro", phone: "+250 788 ••• 932", orders: 6, kg: 66, status: "Active", initials: "MU" },
    { id: "CUS-0252", name: "Patrick Habimana", region: "Nyarugenge", phone: "+250 788 ••• 514", orders: 9, kg: 108, status: "Active", initials: "PH" },
    { id: "CUS-0231", name: "Claudine Akimana", region: "Gasabo", phone: "+250 788 ••• 663", orders: 4, kg: 42, status: "New", initials: "CA" },
    { id: "CUS-0198", name: "Eric Ndayisaba", region: "Kicukiro", phone: "+250 788 ••• 051", orders: 11, kg: 150, status: "Active", initials: "EN" }
  ],
  regions: { Gasabo: 1180, Nyarugenge: 980, Kicukiro: 760, "Other Kigali": 500 },
  orderCount: 248,
  confirmedKg: 3420,
  forecastKg: 4860,
  orderSequence: 249,
  refillAction: "suggested",
  personalOrders: [
    { date: "Oct 18, 2026", kg: 12, price: "RWF 19,300", ref: "DG-0244", customerId: "CUS-0284" },
    { date: "Sep 17, 2026", kg: 12, price: "RWF 19,100", ref: "DG-0198", customerId: "CUS-0284" },
    { date: "Aug 16, 2026", kg: 12, price: "RWF 19,450", ref: "DG-0151", customerId: "CUS-0284" }
  ],
  repayments: [
    { date: "Oct 05, 2026", reference: "OWN-PAY-004", amount: 5000 },
    { date: "Sep 05, 2026", reference: "OWN-PAY-003", amount: 5000 },
    { date: "Aug 05, 2026", reference: "OWN-PAY-002", amount: 5000 },
    { date: "Jul 05, 2026", reference: "OWN-PAY-001", amount: 5000 }
  ],
  preferences: {
    emailAlerts: true,
    lowSupplyReminder: true,
    priceAlerts: true,
    weeklyDigest: false
  },
  workspace: {
    name: "DirectGas Rwanda",
    region: "Kigali",
    currency: "RWF",
    timezone: "Africa/Kigali"
  }
};

export const regions = ["Gasabo", "Nyarugenge", "Kicukiro", "Other Kigali"];

export const demandTrend = {
  confirmed: [220, 280, 250, 340, 310, 370, 330, 420, 395, 460, 430, 510],
  predicted: [255, 305, 290, 355, 360, 390, 385, 435, 450, 480, 490, 530]
};
