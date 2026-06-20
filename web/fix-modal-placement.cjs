const fs = require('fs');
const base = 'C:/Users/samy7/Documents/GitHub/Meereo-frontend/web/src/pages/cockpit';

// Fix: move the modal renders from after the return() to inside it
// The pattern is: modal was inserted before the last `}` but it needs to be
// inside the JSX return, before the closing `</div>\n  )\n`

const modalFixes = [
  {
    file: base + '/Projects.jsx',
    modal: '<ProjetModal isOpen={showCreateProject} onClose={() => setShowCreateProject(false)} showToast={showToast} />',
  },
  {
    file: base + '/Clients.jsx',
    modal: '<ClientModal isOpen={showCreateClient} onClose={() => setShowCreateClient(false)} showToast={showToast} />',
  },
  {
    file: base + '/Offers.jsx',
    modal: '<OfferModal isOpen={showCreateOffer} onClose={() => setShowCreateOffer(false)} showToast={showToast} />',
  },
  {
    file: base + '/Contracts.jsx',
    modal: '<ContractModal isOpen={showCreateContract} onClose={() => setShowCreateContract(false)} showToast={showToast} />',
  },
  {
    file: base + '/Contractors.jsx',
    modal: '<ContractorModal isOpen={showCreateContractor} onClose={() => setShowCreateContractor(false)} showToast={showToast} />',
  },
  {
    file: base + '/Reports.jsx',
    modal: '<ReportModal isOpen={showCreateReport} onClose={() => setShowCreateReport(false)} showToast={showToast} />',
  },
  {
    file: base + '/Orders.jsx',
    modal: '<OrderModal isOpen={showCreateOrder} onClose={() => setShowCreateOrder(false)} showToast={showToast} />',
  },
  {
    file: base + '/Suppliers.jsx',
    modal: '<SupplierModal isOpen={showCreateSupplier} onClose={() => setShowCreateSupplier(false)} showToast={showToast} />',
  },
  {
    file: base + '/Worksite.jsx',
    modal: '<ReportModal isOpen={showCreateReport} onClose={() => setShowCreateReport(false)} showToast={showToast} />\n      <NoteModal isOpen={showCreateNote} onClose={() => setShowCreateNote(false)} showToast={showToast} />',
  },
];

for (const { file, modal } of modalFixes) {
  let c = fs.readFileSync(file, 'utf8');
  const filename = file.split('/').pop();

  // Remove the misplaced modal (it was inserted before last `}`)
  // The misplaced pattern is: '\n      <XxxModal ...>\n}' or '\n      <XxxModal .../>\n      <NoteModal .../>\n}'
  // We need to find it and move it inside the JSX return

  // Step 1: Find and remove the modal render that's outside the return
  // It appears as: \n      <XxxModal ...>...\n}
  // We'll find lines containing the modal tag that appear AFTER the last `  )`
  
  const lines = c.split('\n');
  const modalFirstTag = modal.split('\n')[0].slice(0, 30); // first few chars to identify
  
  // Find the line with the misplaced modal (outside JSX return)
  let misplacedIdx = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes(modalFirstTag)) {
      misplacedIdx = i;
      break;
    }
  }
  
  if (misplacedIdx === -1) {
    console.log('No misplaced modal found in', filename, '(skipping)');
    continue;
  }
  
  // Count how many lines the modal takes
  const modalLines = modal.split('\n').length;
  
  // Remove the misplaced lines
  lines.splice(misplacedIdx, modalLines);
  
  // Now find the correct insertion point: find the last `  )` (end of return)
  // and go back to find the closing div/element before it
  let returnCloseIdx = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].match(/^\s*\)\s*$/)) {
      returnCloseIdx = i;
      break;
    }
  }
  
  if (returnCloseIdx === -1) {
    console.log('Could not find return closing ) in', filename);
    // Just put it before the last }
    lines.splice(lines.length - 2, 0, ...modal.split('\n').map(l => '      ' + l));
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
    console.log('Fallback: inserted modal before last } in', filename);
    continue;
  }
  
  // Find the closing tag of the root element (before the `)`)
  // Go backwards from returnCloseIdx to find the last `</div>` or similar
  let rootCloseIdx = returnCloseIdx - 1;
  while (rootCloseIdx > 0 && lines[rootCloseIdx].trim() === '') rootCloseIdx--;
  
  // Insert modal lines before the root closing tag
  const modalInsert = modal.split('\n').map(l => '      ' + l);
  lines.splice(rootCloseIdx, 0, ...modalInsert);
  
  c = lines.join('\n');
  fs.writeFileSync(file, c, 'utf8');
  console.log('Fixed modal placement in', filename);
}

console.log('Modal placement fixes done');
