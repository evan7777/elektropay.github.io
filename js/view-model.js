/***********************************************************************************
* ViewModel class.
* 
* @constructor
*/
function ViewModel() {
    var self = this;
    self.dateRange = [
        "'20111/2011'",
        "'20112/2011'",
        "'20113/2011'",
        "'20114/2011'"
    ];
    self.dateValues = ko.observableArray([0, 4]);
    //self.dateValues.subscribe(function () { self.load(true); });
    self.startDate = ko.computed(function () {
        return self.dateRange[self.dateValues()[0]];
    }, this);
    self.endDate = ko.computed(function () {
        return self.dateRange[self.dateValues()[1] - 1];
    }, this);
    self.total = ko.observable("");
    self.totals = ko.observableArray([]);
    self.totalsByType = ko.observableArray([]);
    self.totalsByRegion = ko.observableArray([]);
    self.totalsByTopPartner = ko.observableArray([]);
    self.totalsByBottomPartner = ko.observableArray([]);
    self.totalsByReportType = ko.observableArray([]);
    self.totalsGoal = ko.computed(function () {
        var sum = 0, avg = 0, span = 0;
        for (var i = 0; i < self.totals().length; i++) {
            sum += self.totals()[i].value();
        }
        avg = sum / self.totals().length;
        span = self.dateValues()[1] - self.dateValues()[0] + 1;
        return avg * span;
    }, this);


    self.init = function () {
        self.loadTotals();
        self.load();
    };

    self.load = function () {
        self.loadTotalsByType();
        self.loadTotalsByRegion();
        self.loadTotalsByTopPartner();
        self.loadTotalsByReportType();
    };

    self.loadTotals = function () {
        var mydata = [];
        //Remote data (only works when deployed on server)
        $.ajax({
            url: "http://lsdemo.componentone.com/SAPService/DashboardData.svc/CopaTotalsByQuarters",
            dataType: "json",
            success: function (data) {
                result = data.d;
                for (var i = 0; i < result.length; i++) {
                    mydata.push(new DataItem(result[i].Name, parseFloat(result[i].Value)));
                }
                self.totals(mydata);
            }
        });
    };

    self.loadTotalsByType = function () {
        var mydata = [];
        //Remote data (only works when deployed on server)
        $.ajax({
            url: "http://lsdemo.componentone.com/SAPService/DashboardData.svc/GetCopaTotalsByTypeWithDates",
            data: { startDate: self.startDate, endDate: self.endDate },
            dataType: "json",
            success: function (data) {
                var sum = 0;
                result = data.d;
                for (var i = 0; i < result.length; i++) {
                    var f = parseFloat(result[i].Value);
                    sum += f;
                    mydata.push(new DataItem(result[i].Name, f));
                }
                self.totalsByType(mydata);
                self.total(sum);
            }
        });
    };

    self.loadTotalsByRegion = function () {
        var mydata = [];
        //Remote data (only works when deployed on server)
        $.ajax({
            url: "http://lsdemo.componentone.com/SAPService/DashboardData.svc/GetCopaTotalsByRegionWithDates",
            data: { startDate: self.startDate, endDate: self.endDate },
            dataType: "json",
            success: function (data) {
                result = data.d;
                for (var i = 0; i < result.length; i++) {
                    mydata.push(new DataItem(result[i].Name, parseFloat(result[i].Value)));
                }
                self.totalsByRegion(mydata);
            }
        });
    };


    self.loadTotalsByTopPartner = function () {
        var mydata = [];
        //Remote data (only works when deployed on server)
        $.ajax({
            url: "http://lsdemo.componentone.com/SAPService/DashboardData.svc/GetCopaTotalsByTopPartnerWithCountAndDates?count=6",
            data: { startDate: self.startDate, endDate: self.endDate },
            dataType: "json",
            success: function (data) {
                result = data.d;
                for (var i = 0; i < result.length; i++) {
                    mydata.push(new DataItem(result[i].Name, parseFloat(result[i].Value)));
                }
                self.totalsByTopPartner(mydata);
            }
        });
    };


    self.loadTotalsByReportType = function () {
        var mydata = [];
        //Remote data (only works when deployed on server)
        $.ajax({
            url: "http://lsdemo.componentone.com/SAPService/DashboardData.svc/GetCopaTotalsByReportTypeWithDates",
            data: { startDate: self.startDate, endDate: self.endDate },
            dataType: "json",
            success: function (data) {
                result = data.d;
                for (var i = 0; i < result.length; i++) {
                    mydata.push(new DataItem(result[i].Name, parseFloat(result[i].Value)));
                }
                self.totalsByReportType(mydata);
            }
        });
    };
}

/***********************************************************************************
* Initializes a new instance of a DataItem.
* DataItem objects have a name and a value.
* @constructor
*/
function DataItem(name, value) {
    var self = this;
    self.name = ko.observable(name || "");
    self.value = ko.observable(value || 0);
}

/**************************************************************************************
* Extracts values from a list and builds a 'seriesList' that can be used as a
* data source for a wijmo chart control.
*/
function formatChartSeriesList(list) {
    var seriesList = [];

    for (var i = 0; i < list.length; i++) {
        var xData = [];
        var yData = [];
        xData.push(list[i].name());
        yData.push(list[i].value());
        seriesList.push({
            label: list[i].name(),
            data: { x: xData, y: yData }
        });
    }
    return seriesList;
}

function formatPieChartSeriesList(list) {
    var seriesList = [];

    for (var i = 0; i < list.length; i++) {
        seriesList.push({
            label: list[i].name(),
            data: list[i].value()
        });
    }
    return seriesList;
}

function formatBubbleChartSeriesList(list) {
    var seriesList = [];

    var xCoords = [8.75, 5.5, 5, 9, 3.5, 2.5, 0, 8];
    var yCoords = [1.25, 4, 3.75, 3.75, 1.5, 3.5, 0, 2.5];

    for (var i = 0; i < list.length; i++) {
        if (list[i].name() !== "NULL") {
            var y1Data = [];
            var xData = [];
            var yData = [];
            xData.push(xCoords[i]);
            yData.push(yCoords[i]);
            y1Data.push(list[i].value());
            seriesList.push({
                label: list[i].name(),
                data: {
                    x: xData,
                    y: yData,
                    y1: y1Data
                }
            });
        }
    }
    return seriesList;
}
function formatChartSeriesListFlat(list) {
    var seriesList = [];
    var xData = [];
    var yData = [];
    var xDataPrev = [];
    var yDataPrev = [];

    if (list.length === 0) {
        return;
    }
    else {
        for (var i = 0; i < list.length; i++) {
            if (i < 4) {
                xDataPrev.push(list[i].name());
                yDataPrev.push(list[i].value());
            }
            else {
                xData.push(list[i].name());
                yData.push(list[i].value());
            }
        }
    }
    seriesList.push({
        markers: {
            visible: true
        },
        label: "2011",
        data: {
            x: xData,
            y: yData
        }
    });
    seriesList.push({
        markers: {
            visible: true
        },
        label: "2010",
        data: {
            x: xDataPrev,
            y: yDataPrev
        }
    });

    return seriesList;
}

function formatBarChartSeriesList(list) {
    var seriesList = [];
    var xData = [];
    var yData = [];

    if (list.length === 0) {
        return;
    }
    else {
        for (var i = 0; i < list.length; i++) {
            xData.push(list[i].name());
            yData.push(list[i].value());
        }
    }

    seriesList.push({
        label: "Sales",
        data: { x: xData, y: yData }
    });

    return seriesList;
}