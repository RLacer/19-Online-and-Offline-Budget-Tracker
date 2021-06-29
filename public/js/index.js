const { json } = require("express");

let transactions = [];
let myChart;

fetch("/api/transaction")
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    transactions = data;

    populateTotal();
    populateTable();
    populateChart();
  });

function populateTotal() {
  let total = transactions.reduce((total, t) => {
    return total + parseInt(t.value);
  }, 0);

  let totalEl = document.querySelector("#total");
  totalEl.textContent = total;
}

function populateTable() {
  let tBody = document.querySelector("#tbody");
  tBody.innerHTML = "";

  transactions.forEach((transaction) => {
    let tRow = document.createElement("tr");
    tRow.innerHTML = `
        <td> ${transaaction.name} </td>
        <td> ${transaction.value} </td>
        `;

    tBody.appendChild(tRow);
  });
}

function populateChart() {
  let reversed = transactions.slice().reverse();
  let sum = 0;

  let labels = reversed.map((t) => {
    let date = new Date(t.date);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear}`;
  });

  let data = reversed.map((t) => {
    sum += parseInt(t.value);
    return sum;
  });

  if (myChart) {
    myChart.destroy();
  }

  let ctx = document.getElementById("myChart").getContext("2d");

  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      dataSets: [
        {
          label: "total over time",
          fill: true,
          backgroundColor: "#33FFA5",
          data,
        },
      ],
    },
  });
}

function sendTransaction(adding) {
  let nameEl = document.querySelector("#t-name");
  let amountEl = document.querySelector("#t-amount");
  let errorEl = document.querySelector(".form .error");

  if (nameEl.value === "" || amountEl.value === "") {
    errorEl.textContent = "Must have name and amount";
    return;
  } else {
    errorEl.textContent = "";
  }

  let transaction = {
    name: nameEl.value,
    value: amountEl.value,
    date: new Date().toISOString(),
  };

  if (!adding) {
    transaction.value *= -1;
  }

  transactions.unshift(transaction);

  populateChart();
  populateTable();
  populateTotal();

  fetch("/api/transaction", {
    method: "POST",
    body: JSON.stringify(transaction),
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      
    },
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      if (data.errors) {
        errorEl.textContent = "Must have name and amount";
      } else {
        nameEl.value = "";
        amountEl.value = "";
      }
    })
    .catch((err) => {
      saveRecord(transaction);
      nameEl.value = "";
      amountEl.value = "";
    });
}

document.querySelector("#add-btn").onClick = function () {
    sendTransaction(true);
};

document.querySelector("#sub-btn").onClick = function () {
    sendTransaction(false);
};
