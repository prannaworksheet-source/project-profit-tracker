flowchart TD
  Start[User Opens App] --> AuthCheck{Authenticated?}
  AuthCheck -- No --> SignIn[Sign In / Sign Up]
  SignIn --> AuthCheck
  AuthCheck -- Yes --> Dashboard[Dashboard]
  Dashboard --> NewProject[Create New Project]
  NewProject --> Dashboard
  Dashboard --> SelectProject[Select Project]
  SelectProject --> ProjectDetail[Project Detail View]
  ProjectDetail --> AddExpense[Add Expense]
  ProjectDetail --> AddInvoice[Add Invoice]
  AddExpense --> APIAddExpense[Call Create Expense API]
  AddInvoice --> APIAddInvoice[Call Create Invoice API]
  APIAddExpense --> Database[Database]
  APIAddInvoice --> Database
  Database --> APIResponse[API Response]
  APIResponse --> ProjectDetail
  ProjectDetail --> UpdatePL[Recalculate Profit And Loss]
  UpdatePL --> Dashboard