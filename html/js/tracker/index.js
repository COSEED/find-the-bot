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
            activeUser: null,
            loading: true,
            tags: [],
            users: [],
            pendingTag: '',
            pendingUser: '',
            editingTag: false,
            editingUser: false
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
            ajaxXHR: null,
            loading: false
        });
    },
        
    handleFirehoseClick: function(e) {
        this.setState({
            activeTag: null,
            activeUser: null
        });
    },

    handleTagClick: function(e) {
        var hashtag = $(e.target).closest('li').attr('data-tag');

        this.setState({
            activeTag: hashtag,
            activeUser: null
        });
    },

    handleUserClick: function(e) {
        var user = $(e.target).closest('li').attr('data-user');

        this.setState({
            activeTag: null,
            activeUser: user
        });
    },

    handleUserRemoveClick: function(i, e) {
        e.stopPropagation();
        var users = [];
        for(var j = 0; j < this.state.users.length; j++) {
            if(i == j) continue;
            users.push(this.state.users[j]);
        }
        this.setState({
            users: users
        });

        if(this.state.activeUser == this.state.users[i]) {
            this.setState({
                activeUser: null
            });
        }
    },

    handleTagRemoveClick: function(i, e) {
        e.stopPropagation();
        var tags = [];
        for(var j = 0; j < this.state.tags.length; j++) {
            if(i == j) continue;
            tags.push(this.state.tags[j]);
        }
        this.setState({
            tags: tags
        });

        if(this.state.activeTag == this.state.tags[i]) {
            this.setState({
                activeTag: null
            });
        }
    },

    handlePlusTagClick: function(e) {
        this.setState({
            editingTag: true,
            pendingTag: '',
            editingUser: false,
            pendingUser: ''
        }, function() {
            this.refs['pendingTagInput'].focus();
        }.bind(this));
    },

    handlePlusUserClick: function(e) {
        this.setState({
            editingUser: true,
            pendingUser: '',
            editingTag: false,
            pendingTag: ''
        }, function() {
            this.refs['pendingUserInput'].focus();
        }.bind(this));
    },

    handleEditingUserBlur: function(e) {
        this.setState({
            editingUser: false,
            pendingUser: ''
        });
    },

    handleEditingUserChange: function(e) {
        this.setState({
            pendingUser: e.target.value
        });
    },

    handleEditingTagBlur: function(e) {
        this.setState({
            editingTag: false,
            pendingTag: ''
        });
    },

    handleEditingTagChange: function(e) {
        this.setState({
            pendingTag: e.target.value
        });
    },

    handleEditingUserSubmit: function(e) {
        e.preventDefault();
        var users = this.state.users;

        users = users.concat([this.state.pendingUser]);

        this.setState({
            users: users,
            editingUser: false,
            pendingUser: ''
        });
    },

    handleEditingTagSubmit: function(e) {
        e.preventDefault();
        var tags = this.state.tags;

        tags = tags.concat([this.state.pendingTag]);

        this.setState({
            tags: tags,
            editingTag: false,
            pendingTag: ''
        });
    },

    render: function() {
        var tweets = [];

        for(var i = 0; i < this.state.tweets.length; i++) {
            tweets.push(<Tweet key={this.state.tweets[i].tweet_id} tweet={this.state.tweets[i]} />);
        }

        if(tweets.length == 0 && this.state.loading) {
            tweets.push(<p key={'loading'}>Loading tweets...</p>);
        } else if(tweets.length == 0) {
            tweets.push(<p key={'loading'}>There are no tweets yet.</p>);
        }

        var refresh = [];
        var tags = [], users = [];

        for(var i = 0; i < this.state.tags.length; i++) {
            var cls = "";
            if(this.state.activeTag === this.state.tags[i]) {
                cls += "nav-active";
            }

            tags.push(<li key={i} data-tag={this.state.tags[i]} onClick={this.handleTagClick} className={cls}>
                #{this.state.tags[i]}
                <span onClick={this.handleTagRemoveClick.bind(this, i)} className="glyphicon glyphicon-remove"></span>
            </li>);
        }

        var tags_banner = '';
        if(this.state.tags.length == 0 && !this.state.editingTag) {
            tags_banner = <p className="banner">Click the + to add a new tag to the tracker, or hover over a tag in the feed to add.</p>;
        }

        for(var i = 0; i < this.state.users.length; i++) {
            var cls = "";
            if(this.state.activeUser === this.state.users[i]) {
                cls += "nav-active";
            }

            users.push(<li key={i} data-user={this.state.users[i]} onClick={this.handleUserClick} className={cls}>
                @{this.state.users[i]}
                <span onClick={this.handleUserRemoveClick.bind(this, i)} className="glyphicon glyphicon-remove"></span>
            </li>);
        }

        var users_banner = '';
        if(this.state.users.length == 0 && !this.state.editingUser) {
            users_banner = <p className="banner">Click the + to add a new profile to the tracker, or hover over a user's avatar in the feed to add.</p>;
        }

        if(this.state.editingUser) {
            users.push(<li key={'editing'}>@<form onSubmit={this.handleEditingUserSubmit}><input type="text" ref="pendingUserInput" placeholder="TheRealDonaldTrump" value={this.state.pendingUser} onBlur={this.handleEditingUserBlur} onChange={this.handleEditingUserChange} /></form></li>);
        }
        if(this.state.editingTag) {
            tags.push(<li key={'editing'}>#<form onSubmit={this.handleEditingTagSubmit}><input type="text" ref="pendingTagInput" placeholder="usa" value={this.state.pendingTag} onBlur={this.handleEditingTagBlur} onChange={this.handleEditingTagChange} /></form></li>);
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
                    <span className="header">Track Tags <span onClick={this.handlePlusTagClick} className="glyphicon glyphicon-plus-sign"></span></span>
                    <div className="entries">
                        <ul>
                            {tags}
                        </ul>
                    </div>
                    {tags_banner}
                </div>

                <div className="nav profile">
                    <span className="header">Track Profiles <span onClick={this.handlePlusUserClick} className="glyphicon glyphicon-plus-sign"></span></span>
                    <div className="entries">
                        <ul>
                            {users}
                        </ul>
                    </div>
                    {users_banner}
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
