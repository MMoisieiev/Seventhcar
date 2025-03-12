// insurance.js


  /* ===========================================
     1) HELPER FUNCTIONS FOR SELECTION
     =========================================== */
  
  window.saveSelectedInsurance = function saveSelectedInsurance(id, price) {
    localStorage.setItem("selectedInsurance", JSON.stringify({ id, price }));
  };
  
  window.getSelectedInsurance = function getSelectedInsurance() {
    return JSON.parse(localStorage.getItem("selectedInsurance"));
  };
  
  window.updateInsuranceSummary = function updateInsuranceSummary() {
    const insurance = getSelectedInsurance();
    if (insurance) {
      const summaryEl = document.getElementById("insuranceSummary");
      if (summaryEl) {
        summaryEl.innerHTML = `Insurance: ${insurance.id} - ${insurance.price} EUR`;
      }
    }
  };
  
  /* ===========================================
     2) TABLE-BASED COMPARISON
     =========================================== */
  
  window.loadInsuranceComparisonTable = function() {
    // Hard-coded example data. 
    // In reality, you can fetch this from /api/insurance if you prefer:
    const insurancePlans = [
      {
        id: 'basic',
        name: 'Basic Protect',
        price: 0,
        dailyLabel: '0,00 EUR / day',
        details: {
          responsibilityExcess: true,
          tpl: true,
          additionalDrivers: false,
          unlimitedMileage: true,
          cdw: true,
          tp: false,
          roadAssistance: true,
          wug: false,
          pai: false
        }
      },
      {
        id: 'medium',
        name: 'Medium Protect',
        price: 20,
        dailyLabel: '20,00 EUR / day',
        details: {
          responsibilityExcess: true,
          tpl: true,
          additionalDrivers: true,
          unlimitedMileage: true,
          cdw: true,
          tp: true,
          roadAssistance: true,
          wug: false,
          pai: true
        }
      },
      {
        id: 'full',
        name: 'Full Protect',
        price: 30,
        dailyLabel: '30,00 EUR / day',
        details: {
          responsibilityExcess: true,
          tpl: true,
          additionalDrivers: true,
          unlimitedMileage: true,
          cdw: true,
          tp: true,
          roadAssistance: true,
          wug: true,
          pai: true
        }
      }
    ];
  
    // Coverage aspects for table rows
    const coverageAspects = [
      { key: 'responsibilityExcess', label: 'Responsibility (Excess)' },
      { key: 'tpl',                  label: 'TPL' },
      { key: 'additionalDrivers',    label: 'Additional Drivers' },
      { key: 'unlimitedMileage',     label: 'Unlimited Mileage' },
      { key: 'cdw',                  label: 'CDW' },
      { key: 'tp',                   label: 'TP' },
      { key: 'roadAssistance',       label: 'Road Assistance 24/7' },
      { key: 'wug',                  label: 'WUG' },
      { key: 'pai',                  label: 'PAI' }
    ];
  
    // Build an HTML structure that uses your .insurance-wrap and .insurance-item-wrap classes
    let html = `
      <div class="insurance-wrap">
        <!-- .insurance-item-wrap is a box/card style from your CSS -->
        <div class="insurance-item-wrap">
          <table class="insurance-comparison" style="width:100%;">
            <thead>
              <tr>
                <th style="text-align:left;"></th>
                ${insurancePlans.map(plan => `
                  <th style="text-align:center;">
                    <div style="font-weight:bold;">${plan.name}</div>
                    <div class="price">${plan.dailyLabel}</div>
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              ${coverageAspects.map(aspect => {
                let row = `<tr>
                  <td style="text-align:left;padding:0.5rem;">${aspect.label}</td>`;
                insurancePlans.forEach(plan => {
                  const hasFeature = plan.details[aspect.key];
                  row += `<td style="text-align:center;padding:0.5rem;">
                            ${hasFeature ? '✔' : '✘'}
                          </td>`;
                });
                row += `</tr>`;
                return row;
              }).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td><strong>Select Plan</strong></td>
                ${insurancePlans.map(plan => `
                  <td style="text-align:center;">
                    <label class="custom-radio">
                      <input type="radio" name="insurancePlan" value="${plan.id}" data-price="${plan.price}">
                      Select
                    </label>
                  </td>
                `).join('')}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;
  
    // Inject into the #insuranceComparison container
    const container = document.getElementById('insuranceComparison');
    if (!container) return;
    container.innerHTML = html;
  
    // Add event listeners to radio inputs
    container.querySelectorAll('input[name="insurancePlan"]').forEach(radio => {
      radio.addEventListener('change', function() {
        const selectedId = this.value;
        const price = this.dataset.price;
        window.saveSelectedInsurance(selectedId, price);
        // If you have an autoCalculatePrice() in bookingpage.js, you can call it:
        // window.autoCalculatePrice?.();
      });
    });
  };
  