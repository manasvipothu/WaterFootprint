
                function showVegetarianInputs() {
                    var numFamilyMembers = parseInt(document.getElementById('familyMembers').value);
                    if (numFamilyMembers > 0) {
                        document.getElementById('vegetarianInput').style.display = 'block';
                        document.getElementById('nonVegetarianInput').style.display = 'block';
                    } else {
                        document.getElementById('vegetarianInput').style.display = 'none';
                        document.getElementById('nonVegetarianInput').style.display = 'none';
                    }
                }

        function calculate() {
            var familyMembers = parseInt(document.getElementById('familyMembers').value);
            var showerTime = parseInt(document.getElementById('shower').value);
            var toiletFlushes = parseInt(document.getElementById('toilet').value);
            var dishwasherLoads = parseInt(document.getElementById('dishwasher').value);
            var drinkingWater = parseFloat(document.getElementById('drinking').value);
            var wateringWater = parseFloat(document.getElementById('watering').value);
            var sinkWater = parseFloat(document.getElementById('sink').value);
            var cookingWater = parseFloat(document.getElementById('cooking').value);
            var state = document.getElementById('state').value;
            var hasLawn = document.querySelector('input[name="lawn"]:checked').value === 'yes';
            var hasVehicle = document.querySelector('input[name="vehicle"]:checked').value === 'yes';
            var mileage = parseInt(document.getElementById('mileage').value);
            var recyclePlastic = document.querySelector('input[name="recyclePlastic"]:checked').value === 'yes';
            var recyclePaper = document.querySelector('input[name="recyclePaper"]:checked').value === 'yes';
            var recycleCans = document.querySelector('input[name="recycleCans"]:checked').value === 'yes';
            var donateClothes = document.querySelector('input[name="donateClothes"]:checked').value === 'yes';
            var hasCoffee = document.querySelector('input[name="coffee"]:checked').value === 'yes';
            var hasTea = document.querySelector('input[name="tea"]:checked').value === 'yes';
            var hasGreenTea = document.querySelector('input[name="greenTea"]:checked').value === 'yes';
            var annualIncome = parseInt(document.getElementById('annualIncome').value);
            var vegetarianMembers = parseInt(document.getElementById('vegetarianMembers').value);
            var nonVegetarianMembers = parseInt(document.getElementById('nonVegetarianMembers').value);

            var waterUsage = ((showerTime * 2) + (toiletFlushes * 6) + (dishwasherLoads * 15) +
                drinkingWater + wateringWater + sinkWater + cookingWater) * familyMembers;

            // Additional water usage if user has a lawn/garden
            if (hasLawn) {
                waterUsage += 20 * familyMembers * 365; // Adjust this value based on the average water usage for a lawn/garden
            }

            // Additional water usage if user owns a vehicle
            if (hasVehicle) {
                waterUsage += mileage * 0.5 * familyMembers * 52; // Assuming 0.5 liters per mile for vehicle usage
            }

            // Additional water usage if user recycles
            if (recyclePlastic || recyclePaper || recycleCans) {
                waterUsage -= 5 * familyMembers * 365; // Adjust this value based on the average water saved by recycling
            }

            // Additional water usage if user donates clothes
            if (donateClothes) {
                waterUsage -= 2 * familyMembers * 365; // Adjust this value based on the water saved by donating clothes
            }

            // Additional water usage if user consumes coffee, tea, or green tea
            if (hasCoffee || hasTea || hasGreenTea) {
                waterUsage += 10 * familyMembers * 365; // Adjust this value based on the water consumed by drinking coffee, tea, or green tea
            }

            // Additional water usage based on vegetarian and non-vegetarian family members
            waterUsage += (vegetarianMembers * 5 + nonVegetarianMembers * 15) * 365; // Adjust these values based on average water footprint for vegetarian and non-vegetarian diets

            // Display the result
            var resultElement = document.getElementById('result');
            resultElement.innerText = 'Your estimated annual water footprint is: ' + waterUsage.toFixed(2) + ' liters';

            // Convert liters to gallons
            var gallons = waterUsage * 0.264172;
            resultElement.innerHTML += '<br>Equivalent to approximately ' + gallons.toFixed(2) + ' gallons.';


            // Water usage breakdown
            var breakdown = {
                Shower: showerTime * 2 * familyMembers * 365,
                Toilet: toiletFlushes * 6 * familyMembers * 365,
                Dishwasher: dishwasherLoads * 15 * familyMembers * 52,
                Drinking: drinkingWater * familyMembers * 365,
                Watering: wateringWater,
                Sink: sinkWater * familyMembers * 365,
                Cooking: cookingWater * familyMembers * 365,
                Lawn: hasLawn ? 20 * familyMembers * 365 : 0,
                Vehicle: hasVehicle ? mileage * 0.5 * familyMembers * 52 : 0,
                CoffeeTea: (hasCoffee || hasTea || hasGreenTea) ? 10 * familyMembers * 365 : 0,
                VegetarianDiet: vegetarianMembers * 5 * 365,
                NonVegetarianDiet: nonVegetarianMembers * 15 * 365,
                Recycling: (recyclePlastic || recyclePaper || recycleCans) ? -5 * familyMembers * 365 : 0,
                DonateClothes: donateClothes ? -2 * familyMembers * 365 : 0
            };

            // Recommendations
            var recommendations = [];
            if (showerTime > 10) {
                recommendations.push("Consider reducing your daily shower time.");
            }
            if (toiletFlushes > 5) {
                recommendations.push("Consider installing a low-flush toilet.");
            }
            if (dishwasherLoads > 7) {
                recommendations.push("Try to run the dishwasher only when it's full.");
            }
            if (hasLawn) {
                recommendations.push("Consider using drought-resistant plants to reduce lawn watering.");
            }
            if (hasVehicle) {
                recommendations.push("Consider carpooling or using public transportation to reduce water usage related to driving.");
            }
            if (!recyclePlastic || !recyclePaper || !recycleCans) {
                recommendations.push("Increase your recycling habits to save water.");
            }
            if (!donateClothes) {
                recommendations.push("Donate clothes to reduce water usage in the production of new clothing.");
            }
            if (hasCoffee || hasTea || hasGreenTea) {
                recommendations.push("Reduce your consumption of coffee, tea, or green tea to lower your water footprint.");
            }

            document.getElementById('recommendations').innerHTML = recommendations.length > 0
                ? '<h3>Recommendations:</h3><ul><li>' + recommendations.join('</li><li>') + '</li></ul>'
                : '';

            // Create the 3D pie chart
            Highcharts.chart('waterUsageChart', {
                chart: {
                    type: 'pie',
                    options3d: {
                        enabled: true,
                        alpha: 45,
                        beta: 0
                    }
                },
                title: {
                    text: 'Water Usage Breakdown'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        depth: 35,
                        dataLabels: {
                            enabled: true,
                            format: '{point.name}: {point.y:.2f} liters'
                        }
                    }
                },
                series: [{
                    name: 'Water Usage',
                    data: Object.keys(breakdown).map(function (key) {
                        return { name: key, y: breakdown[key] };
                    })
                }]
            });
        }





        const canvas = document.getElementById("waterCanvas1");
const ctx = canvas.getContext("2d");
requestAnimationFrame(animate);

let width, height;
let time = 0;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

function drawWave(amplitude, wavelength, speed, offsetY, color, opacity) {
    ctx.beginPath();
    ctx.moveTo(0, height);

    for (let x = 0; x <= width; x++) {
        let y = amplitude * Math.sin((x / wavelength) + time * speed) + offsetY;
        ctx.lineTo(x, y);
    }

    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.imageSmoothingEnabled = true;
}

function animate() {
    time += 0.02;

    ctx.clearRect(0, 0, width, height);

    // Background gradient
    let gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#0077b6");
    gradient.addColorStop(1, "#023e8a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Layered waves (depth effect)
 drawWave(15, 250, 1, height * 0.6, "#00b4d8", 0.6);
drawWave(25, 350, 0.7, height * 0.65, "#0096c7", 0.5);
drawWave(35, 450, 0.4, height * 0.7, "#0077b6", 0.4);
    requestAnimationFrame(animate);
}
function resize() {
    const dpr = window.devicePixelRatio || 1;

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.scale(dpr, dpr);
}

animate();