// ------------------------------------------------------------ Example Story

Story(function() {
    this.description = "This is an example story";
    this.summary = {
        as_a : "role",
        i_want : "to perform some action",
        so_that : "there is some perceived benefit"
    };

    this.scenarios = [
        Scenario("Some scenario", function() {
            Given("some string", function() {
                this.someString = 'this';
            });
            And("some number", function() {
                this.ten = 10;
            });
            When("something happens");
            Then("some condition is evaluated", function() {
                this.someString.shouldNotBe(null);
                this.someString.shouldNotBe({});
                this.someString.shouldNotBe(123);
                this.someString.shouldNotBe('that');

                this.someString.shouldBe(this.someString);
                this.someString.shouldBe('this');
            });
            And("some other condition is evaluated", function () {
                this.ten.shouldBe(10);
            });
        }),
        Scenario("Checking incorect values", function() {
            Given("some new precondition");
            And("some other new precondition");
            When("something new happens", function() {
                this.animal = 'animal';
            });
            Then("some new condition is evaluated", function() {
                try {
                    thisVar.doesNotExist();
                } catch(e) {
                    // gulp
                }
            });
            And("some other new condition is evaluated", function() {
                try {
                    this.animal.shouldBe('farm');
                } catch(e) {
                    e.name.shouldBe('AssertionError');
                }
            });
        }),
        Scenario('some complex objects', function() {
            Given(' a complex object', function() {
                this.MyThing = function(val) {
                    this._val = val;
                };

                this.someObj = new this.MyThing('a value');
            });
            And('a copy of it', function() {
                this.sameObj = this.someObj;
            });
            And('a different object', function() {
                this.differentObj = new this.MyThing('a value');
            });
            Then('the object and the copy should be the equal', function() {
                this.someObj.shouldBe(this.sameObj);
                this.sameObj.shouldBe(this.someObj);
            });
            And('the object and the different one should not', function() {
                this.someObj.shouldNotBe(this.differentObj);
                this.differentObj.shouldNotBe(this.someObj);
            });
        })
    ];
}).run();