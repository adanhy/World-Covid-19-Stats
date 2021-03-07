const world = {};
const stats = {};

let lastSelected = {
  lastRegion: ``,
  lastStat: ``,
  lastCountry: ``,
};

const chart = new Chart(document.querySelector(`#statsChart`), {
  type: "bar",
  data: {
    labels: [],
    datasets: [
      {
        label: "",
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 0.3,
      },
    ],
  },
  options: {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
  },
});

const AllCountriesURL =
  "https://api.codetabs.com/v1/proxy?quest=" +
  `https://restcountries.herokuapp.com/api/v1
  `;

const AllInfoURL = `https://corona-api.com/countries`;

async function getWorld() {
  try {
    const allResp = await fetch(AllCountriesURL);
    const allJson = await allResp.json();

    await allJson.forEach((e) => {
      if (!stats[e.cca2]) return;
      if (!world[e.region]) {
        world[e.region] = new Array();
        world[e.region].push({
          name: e.name.common,
          cca: e.cca2,
          statArr: stats[e.cca2],
        });
      } else {
        world[e.region].push({
          name: e.name.common,
          cca: e.cca2,
          statArr: stats[e.cca2],
        });
      }
    });

    world["Other"] = world[""];
    delete world[""];
    console.log(world);
    generateContinentMenu();
  } catch (error) {
    console.log(error);
  }
}

function generateContinentMenu() {
  Object.keys(world).forEach((el) => {
    const b = document.createElement("button");
    b.textContent = el;
    b.classList.add(`glow-on-hover`);

    b.addEventListener(`click`, (e) => {
      document.querySelector(`#countries-box`).innerHTML = ``;
      console.log(world[el]);

      world[el].forEach((v) => {
        const b2 = document.createElement("button");
        b2.textContent = v.name;
        b2.className = `small-btn`;
        document.querySelector(`#countries-box`).appendChild(b2);
      });
    });
    document.querySelector(`#regions-box`).appendChild(b);
  });
}

async function generateStatsButtons() {
  for (const prop in stats.AF.data) {
    if (Number.isInteger(stats.AF.data[prop])) {
      const b = document.createElement("button");
      b.textContent = prop;
      b.className = `glow-on-hover`;
      document.querySelector(`#stat-type-box`).appendChild(b);
    }
  }
}

async function getInfo() {
  try {
    const infoResp = await fetch(AllInfoURL);
    const infoJson = await infoResp.json();

    infoJson.data.forEach((element) => {
      stats[element.code] = {
        data: element.latest_data,
        latestUpdate: element.updated_at,
      };
    });

    generateStatsButtons();
  } catch (error) {
    console.log(error);
  }
}

function getStatByRegion(region, instat) {
  const labels = [];
  const values = [];

  world[region].forEach((ta) => {
    labels.push(ta.name);

    values.push(ta.statArr.data[instat]);
  });

  removeDataFromChart(chart);
  addDatatoChart(chart, `# of ${instat} in ${region}`, labels, values);
  chart.update();
}

function addDatatoChart(chart, label, labels, data) {
  chart.data.labels = labels;
  chart.data.datasets[0].label = label;
  console.log(`adding ${data.length} elements to chart`);
  data.forEach((d) => {
    chart.data.datasets[0].data.push(d);
    chart.data.datasets[0].backgroundColor.push(getRandomColor());
    chart.data.datasets[0].borderColor.push(getRandomColor());
  });
  chart.update();
}

function removeDataFromChart(chart) {
  chart.data.labels.pop();
  const l = chart.data.datasets[0].data.length;
  console.log(`removing ${l} elements from chart`);
  for (let i = 0; i < l; i++) {
    chart.data.datasets[0].data.pop();
    chart.data.datasets[0].backgroundColor.pop();
    chart.data.datasets[0].borderColor.pop();
  }
  chart.update();
}

function getRandomColor() {
  return (
    "rgb(" +
    Math.floor(Math.random() * 255) +
    "," +
    Math.floor(Math.random() * 255) +
    "," +
    Math.floor(Math.random() * 255) +
    ")"
  );
}

function setRegionsButtons() {
  const yrrr = document.querySelector(`#regions-box`);
  yrrr.addEventListener(`click`, (e) => {
    if (document.querySelector(`.selected-region`)) {
      document
        .querySelector(`.selected-region`)
        .classList.remove(`selected-region`);
    }
    e.target.classList.add(`selected-region`);

    lastSelected.lastRegion = e.target.textContent;
    console.log(
      `selected: ${lastSelected.lastRegion} with ${lastSelected.lastStat}`
    );
    getStatByRegion(lastSelected.lastRegion, lastSelected.lastStat);
  });
}

function setStatsButtonsEvents() {
  const y = document.querySelector(`#stat-type-box`);
  y.addEventListener(`click`, (e) => {
    if (document.querySelector(`.selected-stat`)) {
      document
        .querySelector(`.selected-stat`)
        .classList.remove(`selected-stat`);
    }
    e.target.classList.add(`selected-stat`);
    lastSelected.lastStat = e.target.textContent;
    console.log(`selected: ${lastSelected.lastStat}`);
    getStatByRegion(lastSelected.lastRegion, lastSelected.lastStat);
  });
}

function setCountriesButtonEvents() {
  const cnt = document.querySelector(`#countries-box`);
  const strip = document.querySelector(`#cont-stats`);

  cnt.addEventListener(`mouseover`, (ev) => {
    strip.style.visibility = `visible`;
    strip.innerHTML = "";
    const obj =
      world[lastSelected.lastRegion][
        world[lastSelected.lastRegion].reduce((acc, v, i) => {
          if (v.name === ev.target.textContent) return i;
          return acc;
        }, 0)
      ];
    console.log(obj);
    const col = getRandomColor();
    const head = document.createElement(`h1`);
    head.textContent = obj.name;
    head.style.color = col;
    strip.appendChild(head);

    const timelbl = document.createElement(`h3`);
    timelbl.textContent = `Last Updated`;
    timelbl.style.color = col;
    strip.appendChild(timelbl);

    const time = document.createElement(`h3`);
    time.textContent = Date(obj.statArr.latestUpdate);
    time.style.color = col;
    strip.appendChild(time);

    for (const prop in obj.statArr.data) {
      if (Number.isInteger(obj.statArr.data[prop])) {
        const lbl = document.createElement(`h3`);
        lbl.textContent = `${prop}: ${obj.statArr.data[prop]}`;
        lbl.style.color = col;
        strip.appendChild(lbl);
      }
    }

    console.log();
  });

  cnt.addEventListener(`mouseout`, () => {
    strip.style.visibility = `hidden`;
  });
}

getInfo();
getWorld();
setRegionsButtons();
setStatsButtonsEvents();
setCountriesButtonEvents();
