param(
    [Parameter(Mandatory = $true)]
    [string]$Title
)

Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes

$root = [System.Windows.Automation.AutomationElement]::RootElement
$isChromeWindow = New-Object System.Windows.Automation.PropertyCondition(
    [System.Windows.Automation.AutomationElement]::ClassNameProperty, 'Chrome_WidgetWin_1')
$isTabItem = New-Object System.Windows.Automation.PropertyCondition(
    [System.Windows.Automation.AutomationElement]::ControlTypeProperty,
    [System.Windows.Automation.ControlType]::TabItem)

$windows = $root.FindAll([System.Windows.Automation.TreeScope]::Children, $isChromeWindow) |
    Where-Object { $_.Current.Name.EndsWith('Google Chrome') }

$seen = @()
foreach ($window in $windows) {
    foreach ($tab in $window.FindAll([System.Windows.Automation.TreeScope]::Descendants, $isTabItem)) {
        $name = $tab.Current.Name
        $seen += $name
        if (-not $name.StartsWith($Title)) { continue }

        $windowPattern = $window.GetCurrentPattern([System.Windows.Automation.WindowPattern]::Pattern)
        if ($windowPattern.Current.WindowVisualState -eq [System.Windows.Automation.WindowVisualState]::Minimized) {
            $windowPattern.SetWindowVisualState([System.Windows.Automation.WindowVisualState]::Normal)
        }
        $tab.GetCurrentPattern([System.Windows.Automation.SelectionItemPattern]::Pattern).Select()
        exit 0
    }
}

Write-Error "No Chrome tab starting with '$Title'. Saw: $($seen -join ' | ')"
exit 1
