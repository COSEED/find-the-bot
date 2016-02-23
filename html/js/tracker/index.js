var Tweet = React.createClass({
    render: function() {
        return <div>
            <p>{this.props.tweet.text}</p>
        </div>;
    }
});

var Tracker = React.createClass({
    componentDidMount: function() {
        window.setInterval(this._tick, 20*1000);
        this._tick();
    },

    getInitialState: function() {
        return {
            tweets: []
        };
    },
    
    _tick: function() {
        $.ajax({
            url: '/stream',
            success: this._updateStream
        });
    },

    _updateStream: function(result, textStatus, jqXHR) {
        this.setState({
            tweets: result.tweets
        });
    },

    render: function() {
        var tweets = [];

        for(var i = 0; i < this.state.tweets.length; i++) {
            tweets.push(<Tweet key={this.state.tweets[i].tweet_id} tweet={this.state.tweets[i]} />);
        }

        return <div>
            {tweets}
        </div>;
    }
});

ReactDOM.render(
    <Tracker />, 
    document.getElementById('container')
);
