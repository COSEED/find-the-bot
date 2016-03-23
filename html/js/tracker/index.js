var Tweet = React.createClass({
    render: function() {
        return <div className="tweet">
            <p dangerouslySetInnerHTML={{__html: this.props.tweet.text}} />
        </div>;
    }
});

var Tracker = React.createClass({
    componentDidMount: function() {
        window.setInterval(this._tick, 100);
        this._tick();
    },

    getInitialState: function() {
        return {
            tweets: [],
            ajaxXHR: null,
            activeTag: null,
            activeUser: null
        };
    },
    
    _tick: function() {
        if(this.state.ajaxXHR !== null) {
            return;
        }

        var ajaxXHR = $.ajax({
            url: '/stream',
            data: {
                tag: this.state.activeTag,
                user: this.state.activeUser
            },
            success: this._updateStream
        });

        this.setState({
            ajaxXHR: ajaxXHR
        });
    },

    _updateStream: function(result, textStatus, jqXHR) {
        this.setState({
            tweets: result.tweets,
            ajaxXHR: null
        });
    },
        
    handleFirehoseClick: function(e) {
        this.setState({
            activeTag: null,
            activeUser: null
        });
    },

    handleTagClick: function(e) {
        var user = $(e.target).closest('li').attr('data-hashtag');

        this.setState({
            activeTag: hashtag
        });
    },

    handleUserClick: function(e) {
        var user = $(e.target).closest('li').attr('data-user');

        this.setState({
            activeUser: user
        });
    },

    render: function() {
        var tweets = [];

        for(var i = 0; i < this.state.tweets.length; i++) {
            tweets.push(<Tweet key={this.state.tweets[i].tweet_id} tweet={this.state.tweets[i]} />);
        }

        if(tweets.length == 0) {
            tweets.push(<p key={'loading'}>Loading tweets...</p>);
        }

        var refresh = [];
        var tags = [], users = [];

        var tags_orig = ['daesh', 'hillary', 'starwars'];
        var users_orig = ['everyslug', 'libthebasedbot', 'jeb_bush_baby', 't'];

        for(var i = 0; i < tags_orig.length; i++) {

        }

        for(var i = 0; i < users_orig.length; i++) {
            var cls = "";
            if(this.state.activeUser === users_orig[i]) {
                cls += "nav-active";
            }

            users.push(<li key={i} data-user={users_orig[i]} onClick={this.handleUserClick} className={cls}>@{users_orig[i]}</li>);
        }

        var firehose_cls = "nav  nav-loading firehose";

        if(this.state.activeUser === null && this.state.activeTag === null) {
            firehose_cls += " nav-active";
        }

        return <div>
            <div id="leftpanel">
                <div onClick={this.handleFirehoseClick} className={firehose_cls}>
                    <span className="header">Firehose</span>
                    {refresh}
                </div>

                <div className="nav tag">
                    <span className="header">Track Tags <span className="glyphicon glyphicon-plus"></span></span>
                    <div className="entries">
                        <ul>
                            {tags}
                        </ul>
                    </div>
                </div>

                <div className="nav profile">
                    <span className="header">Track Profiles <span className="glyphicon glyphicon-plus"></span></span>
                    <div className="entries">
                        <ul>
                            {users}
                        </ul>
                    </div>
                </div>
            </div>
            <div id="mainpanel">
                {tweets}
            </div>
        </div>;
    }
});

ReactDOM.render(
    <Tracker />, 
    document.getElementById('container')
);
