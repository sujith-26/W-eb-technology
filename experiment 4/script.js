document.getElementById('emiForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    let loanAmount = parseFloat(document.getElementById('loanAmount').value);
    let interestRate = parseFloat(document.getElementById('interestRate').value);
    let loanTerm = parseFloat(document.getElementById('loanTerm').value);

    if(isNaN(loanAmount) || isNaN(interestRate) || isNaN(loanTerm)) {
        alert("Please enter valid numeric values.");
        return;
    }

    let monthlyInterestRate = (interestRate / 100) / 12;
    let emi = (loanAmount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -loanTerm));
    emi = emi.toFixed(2);

    displayEMIResult(emi);
});

function displayEMIResult(emi) {
    let emiResult = document.getElementById('emiResult');
    emiResult.innerHTML = `<p>EMI: Rs. ${emi} / month</p>`;
}
