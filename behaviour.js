// ------------------------------------------------------------ Function augmentation

/**
 * Standard means of augmenting everything with new methods
 *
 * @param name the name of the new method
 * @param func the function we want invoked
 */
Object.prototype.method = function(name, func) {
    if (!this.prototype[name]) {
        this.prototype[name] = func;
        return this;
    }
};

// ------------------------------------------------------------ Should DSL

behaviourJs = {};

behaviourJs._shouldBe = function(expected) {
    if(expected !== null) {
        var exp = expected.valueOf();
        var self = this.valueOf();
        if(self === exp) {
            return;
        }
    }
    throw {
        name: 'AssertionError',
        message: 'Expected ' + expected + ' but was ' + this
    };
};

Object.method('shouldBe', behaviourJs._shouldBe);
Object.method('shouldEqual', behaviourJs._shouldBe);
Object.method('shouldBeEqual', behaviourJs._shouldBe);
Object.method('shouldBeEqualTo', behaviourJs._shouldBe);

behaviourJs._shouldNotBe = function(expected) {
    if(expected !== null) {
        var exp = expected.valueOf();
        var self = this.valueOf();
        if (self !== exp) {
            return;
        }
        throw {
            name: 'AssertionError',
            message: 'Expected not to be ' + expected + ' but was ' + this
        };
    }
};

Object.method('shouldNotBe', behaviourJs._shouldNotBe);
Object.method('shouldNotEqual', behaviourJs._shouldNotBe);
Object.method('shouldntBe', behaviourJs._shouldNotBe);
Object.method('shouldntEqual', behaviourJs._shouldNotBe);

// ------------------------------------------------------------ StoryInstance

behaviourJs.StoryInstance = function(block) {
    block.call(this);
};

behaviourJs.StoryInstance.prototype.visit = function(visitor) {
    visitor.visitStory(this);
};

behaviourJs.StoryInstance.prototype.run = function() {
    this.visit(new behaviourJs.StoryRunner());
};

// ------------------------------------------------------------ ScenarioInstance

/**
 * A runnable scenario.
 *
 * @param name the description of the scenario
 * @param block the function containing the contents of the scenario (usually
 * a series of Givens,When and Thens).
 */
behaviourJs.ScenarioInstance = function(name, block) {
    this.name = name;
    this._steps = [];

    behaviourJs.ScenarioInstance.__currentScenario = this;

    block.call();

    behaviourJs.ScenarioInstance.__currentScenario = null;
    behaviourJs.ScenarioInstance.__currentPhase = null;
};

behaviourJs.ScenarioInstance.__currentScenario = null;

behaviourJs.ScenarioInstance.__currentPhase = null;

behaviourJs.ScenarioInstance.prototype.addStep = function(step) {
    this._steps[this._steps.length] = step;
};

behaviourJs.ScenarioInstance.prototype.visit = function(visitor) {
    visitor.visitScenario(this);
};

// ------------------------------------------------------------ Step

behaviourJs.Step = function(type, meta, block) {
    this._type = type;
    this._meta = meta;
    this._block = block;
};

behaviourJs.Step.prototype.visit = function(visitor) {
    visitor.visitStep(this);
};

// ------------------------------------------------------------ StoryRunner

behaviourJs.StoryRunner = function() {
    this.storyCtx = {};
};

behaviourJs.StoryRunner.prototype.visitStory = function(story) {
    var title = 'Story: ' + story.description;
    document.writeln(title);
    var line = '';
    for(var i = 0; i < title.length; ++i) {
        line += '=';
    }
    document.writeln(line);
    for (var scenIndex = 0; scenIndex < story.scenarios.length; ++scenIndex) {
        story.scenarios[scenIndex].visit(this);
    }
};

behaviourJs.StoryRunner.prototype.visitScenario = function(scenario) {
    document.writeln('Scenario: ' + scenario.name);
    for (var stepIndex = 0; stepIndex < scenario._steps.length; ++stepIndex) {
        var step = scenario._steps[stepIndex];
        step.visit(this);
    }
    document.write("\n");
};

behaviourJs.StoryRunner.prototype.visitStep = function(step) {
    var stepDesc = step._type.toUpperCase() + ' ' + step._meta;
    if (step._block === undefined || step._block === null) {
        if (step._type === 'then') {
            stepDesc += ' [PENDING]';
        }
    } else {
        try {
            step._block.call(this.storyCtx);
        } catch(e) {
            if (e.name == 'AssertionError') {
                stepDesc += ' [FAIL : ' + e.message + ']';
            } else {
                stepDesc += ' [ERROR (' + e.name + ') : ' + e.message + ']';
            }
        }
    }
    document.writeln(stepDesc);
};

// ------------------------------------------------------------ DSL

Story = function(block) {
    return new behaviourJs.StoryInstance(block);
};

Scenario = function(name, block) {
    return new behaviourJs.ScenarioInstance(name, block);
};

Given = function(desc, block) {
    var scenario = behaviourJs.ScenarioInstance.__currentScenario;
    behaviourJs.ScenarioInstance.__currentPhase = 'given';

    scenario.addStep(new behaviourJs.Step(behaviourJs.ScenarioInstance.__currentPhase, desc, block));
};

When = function(desc, block) {
    var scenario = behaviourJs.ScenarioInstance.__currentScenario;
    behaviourJs.ScenarioInstance.__currentPhase = 'when';

    scenario.addStep(new behaviourJs.Step(behaviourJs.ScenarioInstance.__currentPhase, desc, block));
};

Then = function(desc, block) {
    var scenario = behaviourJs.ScenarioInstance.__currentScenario;
    behaviourJs.ScenarioInstance.__currentPhase = 'then';

    scenario.addStep(new behaviourJs.Step(behaviourJs.ScenarioInstance.__currentPhase, desc, block));
};

And = function(desc, block) {
    var scenario = behaviourJs.ScenarioInstance.__currentScenario;
    scenario.addStep(new behaviourJs.Step(behaviourJs.ScenarioInstance.__currentPhase, desc, block));
};
