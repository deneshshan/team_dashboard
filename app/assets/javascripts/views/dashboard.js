(function (views, models, collections, router) {

  var DashboardWidget = Backbone.View.extend({
    tagName: "div",
    className: "widget span6",

    events: {
      "click button.widget-delete" : "removeWidget"
    },

    initialize: function(options) {
      _.bindAll(this, "render");
      this.dashboard = options.dashboard;
      console.log("init dash", this.dashboard);
    },

    renderGraph: function(graphElement) {
      var time = "hour";
      var targets = _.map(this.model.get('metrics'), function(metric) {
        return metric.name;
      });

      var hourGraphCollection = new collections.Graph({
        targets: targets,
        time: time
      });

      hourGraphCollection.fetch({ 
        success: function(collection, response) {
          var hasData = _.any(collection.toJSON(), function(series) {
            return series.data.length > 0;
          });

          if (hasData) {
            graph = new views.Graph({ series: collection.toJSON(), time: time, el: graphElement });
            graph.render();
          } else {
            console.log("no graph data available");
            graphElement.html("<p>No Graph data available in this time frame</p>");
          }
        }
      });
    },

    render: function() {
      $(this.el).html(JST['templates/dashboards/widget']({ instrument: this.model.toJSON() }));
      this.renderGraph(this.$(".graph-container"));
      return this;
    },

    removeWidget: function(event) {
      var tmp = this.dashboard.get("instruments");
      tmp.splice(_.indexOf(tmp, this.model.id), 1);

      this.dashboard.set({ instruments: tmp });
      var result = this.dashboard.save({ 
        success: function(model, request) {
          console.log("saved model: ", model);
        },
        error: function(model, request) {
          alert("failed saving model "+request);
        }
      });

      this.remove();
      this.unbind();
    }

  });

  var InstrumentsChooserDialog = Backbone.View.extend({
    events: {
      "click .btn-primary" : "addInstrument"
    },

    initialize: function(options) {
    },
  
    render: function() {
      $(this.el).html(JST['templates/dashboards/instruments_chooser']({ dashboard: this.model.toJSON() }));

      var myModal = this.$('#dashboard-details-modal');
      var that = this;
      collections.instruments.fetch({ 
        success: function(instruments, response) {
          var filtered = instruments.filter(function(instrument) {
              return !_.include(that.model.get("instruments"), instrument.get('id'));
          });

          var instrumentsSmall = new views.InstrumentsSmall({ collection: new collections.Instrument(filtered) });
          instrumentsSmall.render();
          that.$(".instruments-index-small-container").html(instrumentsSmall.el);

          myModal.modal({ keyboard: true });
        },
        error: function(model, response) {
          alert("Error request: "+response);
        }
      });

      return this;
    },

    addInstrument: function() {
      var myModal = this.$('#dashboard-details-modal');
      var tmp = this.model.get("instruments");
      var selectedCheckboxes = $("input:checked").each(function(index) {
        var id = $(this).attr("data-id")
        tmp.push(id);
      });

      myModal.modal("hide");
      this.model.set({ instruments: tmp });
      var result = this.model.save({ 
        success: function(model, request) {
          console.log("saved model: ", model);
        },
        error: function(model, request) {
          alert("failed saving model "+request);
        }
      });
      
      return false;
    }

  });

  views.Dashboard = Backbone.View.extend({
    events: {
      "click .btn.add-instrument" : "showInstrumentsChooser",
      "click button.dashboard-delete" : "removeDashboard",
      "click span[data-inline-edit]"         : "editName",
      "submit form[data-inline-edit]"      : "saveName",
      "keyup form[data-inline-edit]>input" : "cancelEdit"
    },

    initialize: function(options) {
      _.bindAll(this, "render");
      this.model.bind('reset', this.render);
      this.model.bind('change', this.render);
    },

    renderWidgets: function() {
      var that = this;
      console.log("renderWidgets", this.model, this.model.get('instruments'));
      var targets = _.each(this.model.get('instruments'), function(id) {
        var instrument = new app.models.Instrument({ id: id});

        instrument.fetch({ 
          success: function(model, request) {
            var widget = new DashboardWidget({ model: model, dashboard: that.model });
            widget.render();
            this.$("#dashboard-widget-container").append(widget.el);
          },
          error: function(model, request) {
            alert("Error request "+request);
          }
        });
      });
    },

    render: function() {
      console.log("dashboard render");
      $(this.el).html(JST['templates/dashboards/show']({ dashboard: this.model.toJSON() }));

      this.heading = this.$("span[data-inline-edit]");
      this.form = this.$("form[data-inline-edit]");
      this.input = this.$("form[data-inline-edit]>input");

      this.renderWidgets();

      return this;
    },

    showInstrumentsChooser: function() {
      console.log("showInstrumentsChooser");
      var dialog = new InstrumentsChooserDialog({ model: this.model });
      dialog.render();

      this.$("#instruments-chooser").html(dialog.el);
      return false;
    },

    removeDashboard: function() {
      console.log("removeDashboard", router);

      var result = this.model.destroy({ 
        success: function(model, request) {
          console.log("destroyed model: ", model);
          window.app.router.navigate("/dashboards", { trigger: true })
        },
        error: function(model, request) {
          alert("failed destroying model "+request);
        }
      });
      
    },

    editName: function() {
      this.heading.toggle();
      this.form.css("display", "inline");
      this.input.focus();
      return false;
    },

    saveName: function() {
      this.heading.toggle();
      this.form.toggle();

      this.heading.html(this.input.val());
      this.model.set({name: this.input.val() });
      this.model.save();
      return false;
    },

    cancelEdit: function(event) {
      if (event.keyCode == 27) {
        this.heading.toggle();
        this.form.toggle();      
      }
    }

  });

})(app.views, app.models, app.collections, app.router);