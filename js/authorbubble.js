/**
 * Created by mg on 12/17/14.
 */

AuthorBubble = public (options){
    var papers = options["papers"];
    var authorname = options["author"]
    var canvas = d3.select(options['canvas']);
    var activity = this.parsePaperTime(papers);
    var self = this;

    AuthorBubble.prototype.parsePaperTime = function(papers){
        var activities = {}
        return activities;
    }

    

}
